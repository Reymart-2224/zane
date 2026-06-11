"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

type Client = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  username: string;
  role?: string;
  status?: boolean;
};

type Listing = {
  id: string;
  clientId: string;
  title: string;
  listingCategory?: "property" | "product";
  type?: string;
  address?: string;
  price?: string;
  status?: string;
  description?: string;
  featuredImage?: string;
  sliderImages?: string[];
};

type Lead = {
  id: string;
  listingId: string;
  listingTitle?: string;
  companyName?: string;
  clientId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  notes?: string;
  status?: "new" | "answered" | "sales" | "canceled" | "not_interested";
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  };
};

export default function ClientDetailsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const MAX_IMAGE_SIZE_MB = 3;
  const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  const [client, setClient] = useState<Client | null>(null);
const [activeTab, setActiveTab] = useState<"listings" | "leads" | "account">(
  "listings"
);

const TABLE_PAGE_SIZE = 10;

const [listingSearch, setListingSearch] = useState("");
const [listingStatusFilter, setListingStatusFilter] = useState("all");
const [listingCategoryFilter, setListingCategoryFilter] = useState("all");
const [listingsPage, setListingsPage] = useState(1);

const [leadSearch, setLeadSearch] = useState("");
const [leadStatusFilter, setLeadStatusFilter] = useState("all");
const [leadListingFilter, setLeadListingFilter] = useState("all");
const [leadsPage, setLeadsPage] = useState(1);


const [leads, setLeads] = useState<Lead[]>([]);
const [loadingLeads, setLoadingLeads] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);
  const [savingListing, setSavingListing] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [listings, setListings] = useState<Listing[]>([]);

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [sliderImageFiles, setSliderImageFiles] = useState<File[]>([]);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const [sliderPreviews, setSliderPreviews] = useState<string[]>([]);
const [leadNotesDraft, setLeadNotesDraft] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
    status: true,
  });

  const [listingForm, setListingForm] = useState({
    title: "",
    listingCategory: "property",
    type: "",
    address: "",
    price: "",
    status: "active",
    description: "",
  });


  const filteredListings = listings.filter((listing) => {
  const search = listingSearch.toLowerCase();

  const matchesSearch =
    listing.title?.toLowerCase().includes(search) ||
    listing.address?.toLowerCase().includes(search) ||
    listing.type?.toLowerCase().includes(search) ||
    listing.price?.toLowerCase().includes(search);

  const matchesStatus =
    listingStatusFilter === "all" ||
    (listing.status || "active") === listingStatusFilter;

  const matchesCategory =
    listingCategoryFilter === "all" ||
    (listing.listingCategory || "property") === listingCategoryFilter;

  return matchesSearch && matchesStatus && matchesCategory;
});

const listingTotalPages = Math.max(
  1,
  Math.ceil(filteredListings.length / TABLE_PAGE_SIZE)
);

const paginatedListings = filteredListings.slice(
  (listingsPage - 1) * TABLE_PAGE_SIZE,
  listingsPage * TABLE_PAGE_SIZE
);

const filteredLeads = leads.filter((lead) => {
  const search = leadSearch.toLowerCase();

  const matchesSearch =
    lead.name?.toLowerCase().includes(search) ||
    lead.email?.toLowerCase().includes(search) ||
    lead.phone?.toLowerCase().includes(search) ||
    lead.message?.toLowerCase().includes(search) ||
    lead.notes?.toLowerCase().includes(search) ||
    lead.listingTitle?.toLowerCase().includes(search);

  const matchesStatus =
    leadStatusFilter === "all" || (lead.status || "new") === leadStatusFilter;

  const matchesListing =
    leadListingFilter === "all" || lead.listingId === leadListingFilter;

  return matchesSearch && matchesStatus && matchesListing;
});

const leadTotalPages = Math.max(
  1,
  Math.ceil(filteredLeads.length / TABLE_PAGE_SIZE)
);

const paginatedLeads = filteredLeads.slice(
  (leadsPage - 1) * TABLE_PAGE_SIZE,
  leadsPage * TABLE_PAGE_SIZE
);
useEffect(() => {
  setListingsPage(1);
}, [listingSearch, listingStatusFilter, listingCategoryFilter]);

useEffect(() => {
  setLeadsPage(1);
}, [leadSearch, leadStatusFilter, leadListingFilter]);

  const leadCountByListingId = leads.reduce<Record<string, number>>(
  (acc, lead) => {
    if (!lead.listingId) return acc;

    acc[lead.listingId] = (acc[lead.listingId] || 0) + 1;

    return acc;
  },
  {}
);

const  fetchLeads = async () => {
  try {
    setLoadingLeads(true);

    const res = await fetch(`/api/leads?clientId=${clientId}`);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to load leads");
      return;
    }

    const loadedLeads = data.leads || [];

    setLeads(loadedLeads);

    const notesDrafts: Record<string, string> = {};

    loadedLeads.forEach((lead: Lead) => {
      notesDrafts[lead.id] = lead.notes || "";
    });

    setLeadNotesDraft(notesDrafts);
  } catch (err) {
    console.error(err);
    setError("Failed to load leads");
  } finally {
    setLoadingLeads(false);
  }
};
  const fetchClient = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/clients/${clientId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load client");
        return;
      }

      const loadedClient = data.client;
      setClient(loadedClient);

      setForm({
        company_name: loadedClient.company_name || "",
        contact_name: loadedClient.contact_name || "",
        email: loadedClient.email || "",
        phone: loadedClient.phone || "",
        address: loadedClient.address || "",
        username: loadedClient.username || "",
        password: "",
        status: loadedClient.status === false ? false : true,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load client");
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      setLoadingListings(true);

      const res = await fetch(`/api/listings?clientId=${clientId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load listings");
        return;
      }

      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load listings");
    } finally {
      setLoadingListings(false);
    }
  };

useEffect(() => {
  if (clientId) {
    fetchClient();
    fetchListings();
    fetchLeads();
  }
}, [clientId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      status: e.target.value === "active",
    }));
  };

  const handleListingChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setListingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setListingForm((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const resetListingForm = () => {
    setListingForm({
      title: "",
      listingCategory: "property",
      type: "",
      address: "",
      price: "",
      status: "active",
      description: "",
    });

    setFeaturedImageFile(null);
    setSliderImageFiles([]);
    setFeaturedPreview("");
    setSliderPreviews([]);
  };

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return `Image must be ${MAX_IMAGE_SIZE_MB}MB or smaller.`;
    }

    return "";
  };

  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    setError("");

    if (!file) return;

    const validationError = validateImage(file);

    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setFeaturedImageFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
  };

  const handleSliderImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    setError("");

    if (!files.length) return;

    for (const file of files) {
      const validationError = validateImage(file);

      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        e.target.value = "";
        return;
      }
    }

    setSliderImageFiles(files);
    setSliderPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const uploadImageFile = async (
    file: File,
    folder: string
  ): Promise<string> => {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const imageRef = ref(storage, `${folder}/${fileName}`);

    await uploadBytes(imageRef, file);

    return await getDownloadURL(imageRef);
  };

 const createListing = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!client) {
    setError("Client data is not loaded yet.");
    return;
  }

  setError("");
  setSuccess("");
  setSavingListing(true);
  setUploadingImages(true);

  try {
    let featuredImage = "";
    let sliderImages: string[] = [];

    if (featuredImageFile) {
      featuredImage = await uploadImageFile(
        featuredImageFile,
        `clients/${clientId}/featured`
      );
    }

    if (sliderImageFiles.length > 0) {
      sliderImages = await Promise.all(
        sliderImageFiles.map((file) =>
          uploadImageFile(file, `clients/${clientId}/slider`)
        )
      );
    }

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        companyName: client.company_name,
        ...listingForm,
        featuredImage,
        sliderImages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create listing");
      return;
    }

    setSuccess("Listing created successfully.");
    resetListingForm();
    setShowListingForm(false);
    await fetchListings();
  } catch (err) {
    console.error(err);
    setError("Failed to create listing or upload images.");
  } finally {
    setSavingListing(false);
    setUploadingImages(false);
  }
};
const updateLeadStatus = async (leadId: string, status: string) => {
  setError("");
  setSuccess("");

  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to update lead status");
      return;
    }

    setSuccess("Lead status updated successfully.");
    await fetchLeads();
  } catch (err) {
    console.error(err);
    setError("Failed to update lead status");
  }
};
const updateLeadNotes = async (leadId: string, notes: string) => {
  setError("");
  setSuccess("");

  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to update lead notes");
      return;
    }

    setSuccess("Lead notes updated successfully.");
    await fetchLeads();
  } catch (err) {
    console.error(err);
    setError("Failed to update lead notes");
  }
};
  const updateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update client");
        return;
      }

      setSuccess("Client account updated successfully.");
      await fetchClient();
    } catch (err) {
      console.error(err);
      setError("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[28px] bg-white p-8 shadow-sm border border-[#ecf6f4]">
        <p className="text-gray-400">Loading client...</p>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="rounded-[28px] bg-white p-8 shadow-sm border border-[#ecf6f4]">
        <p className="text-red-500">{error}</p>

        <Link
          href="/dashboard/clients"
          className="mt-5 inline-flex rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
        >
          Back to Clients
        </Link>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-6 shadow-sm border border-[#ecf6f4]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <Link
              href="/dashboard/clients"
              className="text-sm font-semibold text-[#2563eb] hover:underline"
            >
              ← Back to Clients
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-[#1d2b35]">
              {client.company_name}
            </h1>

            <p className="text-sm text-gray-400 mt-1">Client ID: {client.id}</p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ${
              client.status
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {client.status ? "Active" : "Inactive"}
          </span>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-sm border border-[#ecf6f4]">
        <div className="flex gap-3 border-b border-[#ecf6f4] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === "listings"
                ? "bg-[#2563eb] text-white"
                : "bg-[#f6fbff] text-gray-500 hover:bg-blue-50"
            }`}
          >
            Listings
          </button>

          <button
  type="button"
  onClick={() => setActiveTab("leads")}
  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
    activeTab === "leads"
      ? "bg-[#2563eb] text-white"
      : "bg-[#f6fbff] text-gray-500 hover:bg-blue-50"
  }`}
>
  Leads
  {leads.length > 0 && (
    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
      {leads.length}
    </span>
  )}
</button>


          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === "account"
                ? "bg-[#2563eb] text-white"
                : "bg-[#f6fbff] text-gray-500 hover:bg-blue-50"
            }`}
          >
            Account Information
          </button>
        </div>

        <div className="pt-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-600">
              {success}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1d2b35]">
                    Listings
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Properties and products connected to this client.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowListingForm(!showListingForm);
                    setError("");
                    setSuccess("");
                  }}
                  className="rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition"
                >
                  {showListingForm ? "Close Form" : "Add Listing"}
                </button>
              </div>

              {showListingForm && (
                <form
                  onSubmit={createListing}
                  className="rounded-[24px] bg-[#f6fbff] border border-blue-100 p-6"
                >
                  <h3 className="text-lg font-bold text-[#1d2b35] mb-5">
                    Add New Listing
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Listing Category
                      </label>
                      <select
                        name="listingCategory"
                        value={listingForm.listingCategory}
                        onChange={handleListingChange}
                        required
                        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="property">Property</option>
                        <option value="product">Product</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        {listingForm.listingCategory === "product"
                          ? "Product Name"
                          : "Property Title"}
                      </label>
                      <input
                        name="title"
                        value={listingForm.title}
                        onChange={handleListingChange}
                        required
                        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        {listingForm.listingCategory === "product"
                          ? "Product Type"
                          : "Property Type"}
                      </label>
                      <select
                        name="type"
                        value={listingForm.type}
                        onChange={handleListingChange}
                        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Select Type</option>

                        {listingForm.listingCategory === "property" ? (
                          <>
                            <option value="House">House</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Condo">Condo</option>
                            <option value="Land">Land</option>
                            <option value="Commercial">Commercial</option>
                          </>
                        ) : (
                          <>
                            <option value="Physical Product">
                              Physical Product
                            </option>
                            <option value="Digital Product">
                              Digital Product
                            </option>
                            <option value="Service">Service</option>
                            <option value="Package">Package</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Price
                      </label>
                      <input
                        name="price"
                        value={listingForm.price}
                        onChange={handleListingChange}
                        placeholder="Example: 250000"
                        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Status
                      </label>
                      <select
                        name="status"
                        value={listingForm.status}
                        onChange={handleListingChange}
                        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        {listingForm.listingCategory === "product"
                          ? "Product Location / Shipping Info"
                          : "Property Address"}
                      </label>
                      <input
                        name="address"
                        value={listingForm.address}
                        onChange={handleListingChange}
                        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        Description
                      </label>

                      <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
                        <ReactQuill
                          theme="snow"
                          value={listingForm.description}
                          onChange={handleDescriptionChange}
                          placeholder="Write listing description here..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        Featured Image
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageChange}
                        className="w-full rounded-xl bg-white border border-blue-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />

                      <p className="text-[11px] text-gray-400">
                        Maximum file size: {MAX_IMAGE_SIZE_MB}MB
                      </p>

                      {featuredPreview && (
                        <img
                          src={featuredPreview}
                          alt="Featured Preview"
                          className="mt-3 h-40 w-full max-w-md rounded-2xl object-cover border border-blue-100"
                        />
                      )}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500">
                        Slider Images
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleSliderImagesChange}
                        className="w-full rounded-xl bg-white border border-blue-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />

                      <p className="text-[11px] text-gray-400">
                        You can select multiple images. Maximum file size per
                        image: {MAX_IMAGE_SIZE_MB}MB
                      </p>

                      {sliderPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                          {sliderPreviews.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Slider Preview ${index + 1}`}
                              className="h-28 w-full rounded-2xl object-cover border border-blue-100"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        resetListingForm();
                        setShowListingForm(false);
                      }}
                      className="rounded-full bg-white border border-blue-100 px-5 py-3 text-sm font-semibold text-gray-500 hover:bg-blue-50 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={savingListing}
                      className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {savingListing
                        ? uploadingImages
                          ? "Uploading images..."
                          : "Saving..."
                        : "Save Listing"}
                    </button>
                  </div>
                </form>
              )}


                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
  <input
    type="text"
    value={listingSearch}
    onChange={(e) => setListingSearch(e.target.value)}
    placeholder="Search listings..."
    className="h-11 rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200 md:col-span-2"
  />

  <select
    value={listingCategoryFilter}
    onChange={(e) => setListingCategoryFilter(e.target.value)}
    className="h-11 rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
  >
    <option value="all">All Categories</option>
    <option value="property">Property</option>
    <option value="product">Product</option>
  </select>

  <select
    value={listingStatusFilter}
    onChange={(e) => setListingStatusFilter(e.target.value)}
    className="h-11 rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
  >
    <option value="all">All Status</option>
    <option value="active">Active</option>
    <option value="pending">Pending</option>
    <option value="sold">Sold</option>
    <option value="inactive">Inactive</option>
  </select>
</div>


              <div className="overflow-hidden rounded-3xl border border-[#ecf6f4]">


                <table className="w-full text-sm">
                  <thead className="bg-[#f6fbff]">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                        Listing
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                        Category
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                        Type
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                        Price
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
  Submissions
</th>
                        <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingListings && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          Loading listings...
                        </td>
                      </tr>
                    )}

                    {!loadingListings && filteredListings.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          No listings found for this client.
                        </td>
                      </tr>
                    )}

                    {!loadingListings &&
                    paginatedListings.map((listing) => (
                        <tr
                          key={listing.id}
                          className="border-t border-[#ecf6f4] hover:bg-[#f8fbff]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {listing.featuredImage ? (
                                <img
                                  src={listing.featuredImage}
                                  alt={listing.title}
                                  className="h-12 w-12 rounded-xl object-cover border border-blue-100"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xs text-blue-500">
                                  No Img
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-[#1d2b35]">
                                  {listing.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {listing.address || "No address"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 capitalize">
                              {listing.listingCategory || "property"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-[#1d2b35]">
                            {listing.type || "-"}
                          </td>

                          <td className="px-6 py-4 text-[#1d2b35]">
                            {listing.price || "-"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 capitalize">
                              {listing.status || "active"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
  <span className="inline-flex rounded-full bg-[#eef7f8] px-3 py-1 text-xs font-bold text-[#296589]">
    {leadCountByListingId[listing.id] || 0}
  </span>
</td>
                          <td className="px-6 py-4">
                           <Link
  href={`/dashboard/clients/${clientId}/listings/${listing.id}`}
  className="inline-flex rounded-full bg-[#f6fbff] border border-blue-100 px-4 py-2 text-xs font-semibold text-[#2563eb] hover:bg-blue-50 transition"
>
  View / Edit
</Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <Pagination
  currentPage={listingsPage}
  totalPages={listingTotalPages}
  totalItems={filteredListings.length}
  onPageChange={setListingsPage}
/>
              </div>
            </div>
          )}

          {activeTab === "leads" && (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-[#1d2b35]">Leads</h2>
      <p className="text-sm text-gray-400 mt-1">
        View inquiries submitted from this client’s listings.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <LeadStatCard label="Total Leads" value={leads.length} />
      <LeadStatCard
        label="New"
        value={leads.filter((lead) => (lead.status || "new") === "new").length}
      />
      <LeadStatCard
        label="Answered"
        value={leads.filter((lead) => lead.status === "answered").length}
      />
      <LeadStatCard
        label="Sales"
        value={leads.filter((lead) => lead.status === "sales").length}
      />
    </div>

 <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
  <input
    type="text"
    value={leadSearch}
    onChange={(e) => setLeadSearch(e.target.value)}
    placeholder="Search leads..."
    className="h-11 rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200 md:col-span-2"
  />

  <select
    value={leadStatusFilter}
    onChange={(e) => setLeadStatusFilter(e.target.value)}
    className="h-11 rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
  >
    <option value="all">All Status</option>
    <option value="new">New</option>
    <option value="answered">Answered</option>
    <option value="sales">Sales</option>
    <option value="canceled">Canceled</option>
    <option value="not_interested">Not Interested</option>
  </select>

  <select
    value={leadListingFilter}
    onChange={(e) => setLeadListingFilter(e.target.value)}
    className="h-11 rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
  >
    <option value="all">All Listings</option>
    {listings.map((listing) => (
      <option key={listing.id} value={listing.id}>
        {listing.title}
      </option>
    ))}
  </select>
</div>


    <div className="overflow-hidden rounded-3xl border border-[#ecf6f4]">
       
      <table className="w-full text-sm">
        <thead className="bg-[#f6fbff]">
          <tr>
            <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
              Lead
            </th>
            <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
              Listing
            </th>
            <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
              Message
            </th>
            <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
  Notes
</th>
            <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
              Status
            </th>
            <th className="text-left px-6 py-4 font-semibold text-[#1d2b35]">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {loadingLeads && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                Loading leads...
              </td>
            </tr>
          )}

          {!loadingLeads && filteredLeads.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                No leads found for this client.
              </td>
            </tr>
          )}

          {!loadingLeads &&
          paginatedLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t border-[#ecf6f4] hover:bg-[#f8fbff]"
              >
                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-[#1d2b35]">{lead.name}</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="block text-xs font-medium text-[#296589] hover:underline"
                  >
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="block text-xs font-medium text-[#296589] hover:underline"
                    >
                      {lead.phone}
                    </a>
                  )}
                </td>

                <td className="px-6 py-4 align-top">
                  <p className="font-semibold text-[#1d2b35]">
                    {lead.listingTitle || "Listing"}
                  </p>
                  <p className="text-xs text-gray-400">
                    ID: {lead.listingId}
                  </p>
                </td>

                <td className="px-6 py-4 align-top">
                  <p className="max-w-[320px] whitespace-pre-wrap text-gray-600">
                    {lead.message}
                  </p>
                </td>
                <td className="px-6 py-4 align-top">
  <div className="min-w-[240px] space-y-2">
    <textarea
      value={leadNotesDraft[lead.id] || ""}
      onChange={(e) =>
        setLeadNotesDraft((prev) => ({
          ...prev,
          [lead.id]: e.target.value,
        }))
      }
      rows={4}
      placeholder="Add internal notes..."
      className="w-full resize-none rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs text-[#1d2b35] outline-none focus:ring-2 focus:ring-blue-200"
    />

    <button
      type="button"
      onClick={() => updateLeadNotes(lead.id, leadNotesDraft[lead.id] || "")}
      className="rounded-full bg-[#296589] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
    >
      Save Notes
    </button>
  </div>
</td>

                <td className="px-6 py-4 align-top">
                  <select
                    value={lead.status || "new"}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="h-10 rounded-xl border border-blue-100 bg-white px-3 text-xs font-semibold text-[#1d2b35] outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="new">New</option>
                    <option value="answered">Answered</option>
                    <option value="sales">Sales</option>
                    <option value="canceled">Canceled</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </td>

                <td className="px-6 py-4 align-top text-gray-500">
                  {lead.createdAt?.seconds
                    ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <Pagination
  currentPage={leadsPage}
  totalPages={leadTotalPages}
  totalItems={filteredLeads.length}
  onPageChange={setLeadsPage}
/>
    </div>
  </div>
)}


          {activeTab === "account" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#1d2b35]">
                  Account Information
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Update client contact details, login username, status, and
                  password.
                </p>
              </div>

              <form
                onSubmit={updateClient}
                className="rounded-[24px] bg-[#f6fbff] border border-blue-100 p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Company Name"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    required
                  />

                  <InputField
                    label="Contact Name"
                    name="contact_name"
                    value={form.contact_name}
                    onChange={handleChange}
                    required
                  />

                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />

                  <InputField
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />

                  <InputField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current password"
                      className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <p className="text-[11px] text-gray-400">
                      Only enter a password if you want to update it.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Status
                    </label>
                    <select
                      value={form.status ? "active" : "inactive"}
                      onChange={handleStatusChange}
                      className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Client address"
                      className="w-full rounded-xl bg-white border border-blue-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {saving ? "Updating..." : "Update Account"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function LeadStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-[#f6fbff] p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#296589]">{value}</p>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#ecf6f4] bg-[#f6fbff] px-5 py-4 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing page{" "}
        <span className="font-semibold text-[#1d2b35]">{currentPage}</span> of{" "}
        <span className="font-semibold text-[#1d2b35]">{totalPages}</span> —{" "}
        <span className="font-semibold text-[#1d2b35]">{totalItems}</span>{" "}
        result{totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-[#296589] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#1d2b35]">
          {currentPage}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-[#296589] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}