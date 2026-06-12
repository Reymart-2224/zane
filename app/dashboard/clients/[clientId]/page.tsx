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

const TABLE_PAGE_SIZE = 10;
const BRAND = "#2f8c74";

export default function ClientDetailsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const MAX_IMAGE_SIZE_MB = 3;
  const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"listings" | "leads" | "account">(
    "listings"
  );

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
  const [leadNotesDraft, setLeadNotesDraft] = useState<Record<string, string>>(
    {}
  );

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

  const fetchLeads = async () => {
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
      <div className="rounded-[22px] border border-[#ecf6f4] bg-white p-6 shadow-sm sm:rounded-[28px] sm:p-8">
        <p className="text-gray-400">Loading client...</p>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="rounded-[22px] border border-[#ecf6f4] bg-white p-6 shadow-sm sm:rounded-[28px] sm:p-8">
        <p className="text-red-500">{error}</p>

        <Link
          href="/dashboard/clients"
          className="mt-5 inline-flex rounded-full bg-[#2f8c74] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#277763]"
        >
          Back to Clients
        </Link>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="w-full max-w-full space-y-5 overflow-hidden">
      <section className="rounded-[22px] border border-[#ecf6f4] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <Link
              href="/dashboard/clients"
              className="text-sm font-semibold text-[#2f8c74] hover:underline"
            >
              ← Back to Clients
            </Link>

            <h1 className="mt-3 break-words text-2xl font-bold text-[#1d2b35]">
              {client.company_name}
            </h1>

            <p className="mt-1 break-all text-sm text-gray-400">
              Client ID: {client.id}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold ${
              client.status
                ? "bg-[#e8f7f3] text-[#2f8c74]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {client.status ? "Active" : "Inactive"}
          </span>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#ecf6f4] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <div className="flex gap-3 overflow-x-auto border-b border-[#ecf6f4] pb-4">
          <TabButton
            label="Listings"
            active={activeTab === "listings"}
            onClick={() => setActiveTab("listings")}
          />

          <TabButton
            label="Leads"
            count={leads.length}
            active={activeTab === "leads"}
            onClick={() => setActiveTab("leads")}
          />

          <TabButton
            label="Account Information"
            active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
          />
        </div>

        <div className="pt-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-[#d9f3ed] bg-[#e8f7f3] px-5 py-3 text-sm text-[#2f8c74]">
              {success}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1d2b35]">
                    Listings
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
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
                  className="w-full rounded-full bg-[#2f8c74] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#277763] sm:w-auto"
                >
                  {showListingForm ? "Close Form" : "Add Listing"}
                </button>
              </div>

              {showListingForm && (
                <ListingForm
                  listingForm={listingForm}
                  savingListing={savingListing}
                  uploadingImages={uploadingImages}
                  featuredPreview={featuredPreview}
                  sliderPreviews={sliderPreviews}
                  maxImageSizeMb={MAX_IMAGE_SIZE_MB}
                  onSubmit={createListing}
                  onChange={handleListingChange}
                  onDescriptionChange={handleDescriptionChange}
                  onFeaturedImageChange={handleFeaturedImageChange}
                  onSliderImagesChange={handleSliderImagesChange}
                  onCancel={() => {
                    resetListingForm();
                    setShowListingForm(false);
                  }}
                />
              )}

              <ListingFilters
                listingSearch={listingSearch}
                listingCategoryFilter={listingCategoryFilter}
                listingStatusFilter={listingStatusFilter}
                setListingSearch={setListingSearch}
                setListingCategoryFilter={setListingCategoryFilter}
                setListingStatusFilter={setListingStatusFilter}
              />

              <div className="space-y-3 md:hidden">
                {loadingListings && (
                  <EmptyCard message="Loading listings..." />
                )}

                {!loadingListings && filteredListings.length === 0 && (
                  <EmptyCard message="No listings found for this client." />
                )}

                {!loadingListings &&
                  paginatedListings.map((listing) => (
                    <ListingMobileCard
                      key={listing.id}
                      listing={listing}
                      clientId={clientId}
                      submissions={leadCountByListingId[listing.id] || 0}
                    />
                  ))}
              </div>

              <div className="hidden overflow-x-auto rounded-3xl border border-[#ecf6f4] md:block">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-[#f6fbfa]">
                    <tr>
                      <TableHead>Listing</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Action</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingListings && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          Loading listings...
                        </td>
                      </tr>
                    )}

                    {!loadingListings && filteredListings.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
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
                          className="border-t border-[#ecf6f4] hover:bg-[#f8fbfb]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {listing.featuredImage ? (
                                <img
                                  src={listing.featuredImage}
                                  alt={listing.title}
                                  className="h-12 w-12 rounded-xl border border-[#d9f3ed] object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d9f3ed] bg-[#e8f7f3] text-xs text-[#2f8c74]">
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
                            <StatusPill text={listing.listingCategory || "property"} />
                          </td>

                          <td className="px-6 py-4 text-[#1d2b35]">
                            {listing.type || "-"}
                          </td>

                          <td className="px-6 py-4 text-[#1d2b35]">
                            {listing.price || "-"}
                          </td>

                          <td className="px-6 py-4">
                            <StatusPill text={listing.status || "active"} />
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-[#e8f7f3] px-3 py-1 text-xs font-bold text-[#2f8c74]">
                              {leadCountByListingId[listing.id] || 0}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/clients/${clientId}/listings/${listing.id}`}
                              className="inline-flex rounded-full border border-[#d9f3ed] bg-[#f6fbfa] px-4 py-2 text-xs font-semibold text-[#2f8c74] transition hover:bg-[#e8f7f3]"
                            >
                              View / Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={listingsPage}
                totalPages={listingTotalPages}
                totalItems={filteredListings.length}
                onPageChange={setListingsPage}
              />
            </div>
          )}

          {activeTab === "leads" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#1d2b35]">Leads</h2>
                <p className="mt-1 text-sm text-gray-400">
                  View inquiries submitted from this client’s listings.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <LeadStatCard label="Total Leads" value={leads.length} />
                <LeadStatCard
                  label="New"
                  value={
                    leads.filter((lead) => (lead.status || "new") === "new")
                      .length
                  }
                />
                <LeadStatCard
                  label="Answered"
                  value={
                    leads.filter((lead) => lead.status === "answered").length
                  }
                />
                <LeadStatCard
                  label="Sales"
                  value={leads.filter((lead) => lead.status === "sales").length}
                />
              </div>

              <LeadFilters
                leadSearch={leadSearch}
                leadStatusFilter={leadStatusFilter}
                leadListingFilter={leadListingFilter}
                listings={listings}
                setLeadSearch={setLeadSearch}
                setLeadStatusFilter={setLeadStatusFilter}
                setLeadListingFilter={setLeadListingFilter}
              />

              <div className="space-y-3 lg:hidden">
                {loadingLeads && <EmptyCard message="Loading leads..." />}

                {!loadingLeads && filteredLeads.length === 0 && (
                  <EmptyCard message="No leads found for this client." />
                )}

                {!loadingLeads &&
                  paginatedLeads.map((lead) => (
                    <LeadMobileCard
                      key={lead.id}
                      lead={lead}
                      leadNotesDraft={leadNotesDraft}
                      setLeadNotesDraft={setLeadNotesDraft}
                      updateLeadNotes={updateLeadNotes}
                      updateLeadStatus={updateLeadStatus}
                    />
                  ))}
              </div>

              <div className="hidden overflow-x-auto rounded-3xl border border-[#ecf6f4] lg:block">
                <table className="w-full min-w-[1200px] text-sm">
                  <thead className="bg-[#f6fbfa]">
                    <tr>
                      <TableHead>Lead</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingLeads && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          Loading leads...
                        </td>
                      </tr>
                    )}

                    {!loadingLeads && filteredLeads.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          No leads found for this client.
                        </td>
                      </tr>
                    )}

                    {!loadingLeads &&
                      paginatedLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-t border-[#ecf6f4] hover:bg-[#f8fbfb]"
                        >
                          <td className="px-6 py-4 align-top">
                            <p className="font-semibold text-[#1d2b35]">
                              {lead.name}
                            </p>
                            <a
                              href={`mailto:${lead.email}`}
                              className="block text-xs font-medium text-[#2f8c74] hover:underline"
                            >
                              {lead.email}
                            </a>
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                className="block text-xs font-medium text-[#2f8c74] hover:underline"
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
                            <LeadNotesBox
                              lead={lead}
                              leadNotesDraft={leadNotesDraft}
                              setLeadNotesDraft={setLeadNotesDraft}
                              updateLeadNotes={updateLeadNotes}
                            />
                          </td>

                          <td className="px-6 py-4 align-top">
                            <LeadStatusSelect
                              value={lead.status || "new"}
                              onChange={(value) =>
                                updateLeadStatus(lead.id, value)
                              }
                            />
                          </td>

                          <td className="px-6 py-4 align-top text-gray-500">
                            {lead.createdAt?.seconds
                              ? new Date(
                                  lead.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={leadsPage}
                totalPages={leadTotalPages}
                totalItems={filteredLeads.length}
                onPageChange={setLeadsPage}
              />
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#1d2b35]">
                  Account Information
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Update client contact details, login username, status, and
                  password.
                </p>
              </div>

              <form
                onSubmit={updateClient}
                className="rounded-[22px] border border-[#d9f3ed] bg-[#f6fbfa] p-4 sm:rounded-[24px] sm:p-6"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
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
                      className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
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
                      className="w-full rounded-xl border border-[#d9f3ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-full bg-[#2f8c74] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#277763] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

function TabButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#2f8c74] text-white"
          : "bg-[#f6fbfa] text-gray-500 hover:bg-[#e8f7f3]"
      }`}
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
          {count}
        </span>
      )}
    </button>
  );
}

function ListingForm({
  listingForm,
  savingListing,
  uploadingImages,
  featuredPreview,
  sliderPreviews,
  maxImageSizeMb,
  onSubmit,
  onChange,
  onDescriptionChange,
  onFeaturedImageChange,
  onSliderImagesChange,
  onCancel,
}: {
  listingForm: {
    title: string;
    listingCategory: string;
    type: string;
    address: string;
    price: string;
    status: string;
    description: string;
  };
  savingListing: boolean;
  uploadingImages: boolean;
  featuredPreview: string;
  sliderPreviews: string[];
  maxImageSizeMb: number;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onDescriptionChange: (value: string) => void;
  onFeaturedImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[22px] border border-[#d9f3ed] bg-[#f6fbfa] p-4 sm:rounded-[24px] sm:p-6"
    >
      <h3 className="mb-5 text-lg font-bold text-[#1d2b35]">
        Add New Listing
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">
            Listing Category
          </label>
          <select
            name="listingCategory"
            value={listingForm.listingCategory}
            onChange={onChange}
            required
            className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
          >
            <option value="property">Property</option>
            <option value="product">Product</option>
          </select>
        </div>

        <InputField
          label={
            listingForm.listingCategory === "product"
              ? "Product Name"
              : "Property Title"
          }
          name="title"
          value={listingForm.title}
          onChange={onChange}
          required
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">
            {listingForm.listingCategory === "product"
              ? "Product Type"
              : "Property Type"}
          </label>
          <select
            name="type"
            value={listingForm.type}
            onChange={onChange}
            className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
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
                <option value="Physical Product">Physical Product</option>
                <option value="Digital Product">Digital Product</option>
                <option value="Service">Service</option>
                <option value="Package">Package</option>
              </>
            )}
          </select>
        </div>

        <InputField
          label="Price"
          name="price"
          value={listingForm.price}
          onChange={onChange}
          placeholder="Example: 250000"
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500">Status</label>
          <select
            name="status"
            value={listingForm.status}
            onChange={onChange}
            className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
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
            onChange={onChange}
            className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-gray-500">
            Description
          </label>

          <div className="overflow-hidden rounded-xl border border-[#d9f3ed] bg-white">
            <ReactQuill
              theme="snow"
              value={listingForm.description}
              onChange={onDescriptionChange}
              placeholder="Write listing description here..."
            />
          </div>
        </div>

        <ImageUpload
          label="Featured Image"
          onChange={onFeaturedImageChange}
          maxImageSizeMb={maxImageSizeMb}
          preview={featuredPreview}
          alt="Featured Preview"
        />

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-gray-500">
            Slider Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onSliderImagesChange}
            className="w-full rounded-xl border border-[#d9f3ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
          />

          <p className="text-[11px] text-gray-400">
            You can select multiple images. Maximum file size per image:{" "}
            {maxImageSizeMb}MB
          </p>

          {sliderPreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {sliderPreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Slider Preview ${index + 1}`}
                  className="h-28 w-full rounded-2xl border border-[#d9f3ed] object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-full border border-[#d9f3ed] bg-white px-5 py-3 text-sm font-semibold text-gray-500 transition hover:bg-[#f6fbfa] sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={savingListing}
          className="w-full rounded-full bg-[#2f8c74] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#277763] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {savingListing
            ? uploadingImages
              ? "Uploading images..."
              : "Saving..."
            : "Save Listing"}
        </button>
      </div>
    </form>
  );
}

function ImageUpload({
  label,
  onChange,
  maxImageSizeMb,
  preview,
  alt,
}: {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxImageSizeMb: number;
  preview: string;
  alt: string;
}) {
  return (
    <div className="space-y-1 md:col-span-2">
      <label className="text-xs font-semibold text-gray-500">{label}</label>

      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="w-full rounded-xl border border-[#d9f3ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      />

      <p className="text-[11px] text-gray-400">
        Maximum file size: {maxImageSizeMb}MB
      </p>

      {preview && (
        <img
          src={preview}
          alt={alt}
          className="mt-3 h-40 w-full max-w-md rounded-2xl border border-[#d9f3ed] object-cover"
        />
      )}
    </div>
  );
}

function ListingFilters({
  listingSearch,
  listingCategoryFilter,
  listingStatusFilter,
  setListingSearch,
  setListingCategoryFilter,
  setListingStatusFilter,
}: {
  listingSearch: string;
  listingCategoryFilter: string;
  listingStatusFilter: string;
  setListingSearch: (value: string) => void;
  setListingCategoryFilter: (value: string) => void;
  setListingStatusFilter: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <input
        type="text"
        value={listingSearch}
        onChange={(e) => setListingSearch(e.target.value)}
        placeholder="Search listings..."
        className="h-11 rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20 md:col-span-2"
      />

      <select
        value={listingCategoryFilter}
        onChange={(e) => setListingCategoryFilter(e.target.value)}
        className="h-11 rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      >
        <option value="all">All Categories</option>
        <option value="property">Property</option>
        <option value="product">Product</option>
      </select>

      <select
        value={listingStatusFilter}
        onChange={(e) => setListingStatusFilter(e.target.value)}
        className="h-11 rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}

function LeadFilters({
  leadSearch,
  leadStatusFilter,
  leadListingFilter,
  listings,
  setLeadSearch,
  setLeadStatusFilter,
  setLeadListingFilter,
}: {
  leadSearch: string;
  leadStatusFilter: string;
  leadListingFilter: string;
  listings: Listing[];
  setLeadSearch: (value: string) => void;
  setLeadStatusFilter: (value: string) => void;
  setLeadListingFilter: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <input
        type="text"
        value={leadSearch}
        onChange={(e) => setLeadSearch(e.target.value)}
        placeholder="Search leads..."
        className="h-11 rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20 md:col-span-2"
      />

      <select
        value={leadStatusFilter}
        onChange={(e) => setLeadStatusFilter(e.target.value)}
        className="h-11 rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
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
        className="h-11 rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      >
        <option value="all">All Listings</option>
        {listings.map((listing) => (
          <option key={listing.id} value={listing.id}>
            {listing.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function ListingMobileCard({
  listing,
  clientId,
  submissions,
}: {
  listing: Listing;
  clientId: string;
  submissions: number;
}) {
  return (
    <div className="rounded-2xl border border-[#ecf6f4] bg-[#f8fbfb] p-4">
      <div className="flex items-start gap-3">
        {listing.featuredImage ? (
          <img
            src={listing.featuredImage}
            alt={listing.title}
            className="h-16 w-16 shrink-0 rounded-xl border border-[#d9f3ed] object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#d9f3ed] bg-[#e8f7f3] text-xs text-[#2f8c74]">
            No Img
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="break-words font-bold text-[#1d2b35]">
            {listing.title}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {listing.address || "No address"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill text={listing.listingCategory || "property"} />
            <StatusPill text={listing.status || "active"} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 text-sm">
        <InfoItem label="Type" value={listing.type || "-"} />
        <InfoItem label="Price" value={listing.price || "-"} />
        <InfoItem label="Submissions" value={String(submissions)} />
      </div>

      <Link
        href={`/dashboard/clients/${clientId}/listings/${listing.id}`}
        className="mt-4 inline-flex w-full justify-center rounded-full bg-[#2f8c74] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#277763]"
      >
        View / Edit
      </Link>
    </div>
  );
}

function LeadMobileCard({
  lead,
  leadNotesDraft,
  setLeadNotesDraft,
  updateLeadNotes,
  updateLeadStatus,
}: {
  lead: Lead;
  leadNotesDraft: Record<string, string>;
  setLeadNotesDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  updateLeadNotes: (leadId: string, notes: string) => void;
  updateLeadStatus: (leadId: string, status: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#ecf6f4] bg-[#f8fbfb] p-4">
      <div className="flex flex-col gap-2">
        <p className="font-bold text-[#1d2b35]">{lead.name}</p>

        <a
          href={`mailto:${lead.email}`}
          className="break-all text-xs font-medium text-[#2f8c74] hover:underline"
        >
          {lead.email}
        </a>

        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="text-xs font-medium text-[#2f8c74] hover:underline"
          >
            {lead.phone}
          </a>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4">
        <InfoItem label="Listing" value={lead.listingTitle || "Listing"} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Message
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
          {lead.message}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <LeadNotesBox
          lead={lead}
          leadNotesDraft={leadNotesDraft}
          setLeadNotesDraft={setLeadNotesDraft}
          updateLeadNotes={updateLeadNotes}
        />

        <LeadStatusSelect
          value={lead.status || "new"}
          onChange={(value) => updateLeadStatus(lead.id, value)}
        />
      </div>
    </div>
  );
}

function LeadNotesBox({
  lead,
  leadNotesDraft,
  setLeadNotesDraft,
  updateLeadNotes,
}: {
  lead: Lead;
  leadNotesDraft: Record<string, string>;
  setLeadNotesDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  updateLeadNotes: (leadId: string, notes: string) => void;
}) {
  return (
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
        className="w-full resize-none rounded-xl border border-[#d9f3ed] bg-white px-3 py-2 text-xs text-[#1d2b35] outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      />

      <button
        type="button"
        onClick={() => updateLeadNotes(lead.id, leadNotesDraft[lead.id] || "")}
        className="rounded-full bg-[#2f8c74] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#277763]"
      >
        Save Notes
      </button>
    </div>
  );
}

function LeadStatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-[#d9f3ed] bg-white px-3 text-xs font-semibold text-[#1d2b35] outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
    >
      <option value="new">New</option>
      <option value="answered">Answered</option>
      <option value="sales">Sales</option>
      <option value="canceled">Canceled</option>
      <option value="not_interested">Not Interested</option>
    </select>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      />
    </div>
  );
}
function LeadStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#d9f3ed] bg-[#f6fbfa] p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#2f8c74]">{value}</p>
    </div>
  );
}

function StatusPill({ text }: { text: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#e8f7f3] px-3 py-1 text-xs font-semibold capitalize text-[#2f8c74]">
      {text}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words font-semibold text-[#1d2b35]">{value}</p>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-left font-semibold text-[#1d2b35]">
      {children}
    </th>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[#ecf6f4] bg-[#f8fbfb] px-5 py-10 text-center text-sm text-gray-400">
      {message}
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
    <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#ecf6f4] bg-[#f6fbfa] px-5 py-4 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing page{" "}
        <span className="font-semibold text-[#1d2b35]">{currentPage}</span> of{" "}
        <span className="font-semibold text-[#1d2b35]">{totalPages}</span> —{" "}
        <span className="font-semibold text-[#1d2b35]">{totalItems}</span>{" "}
        result{totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex-1 rounded-full border border-[#d9f3ed] bg-white px-4 py-2 text-xs font-semibold text-[#2f8c74] transition hover:bg-[#e8f7f3] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
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
          className="flex-1 rounded-full border border-[#d9f3ed] bg-white px-4 py-2 text-xs font-semibold text-[#2f8c74] transition hover:bg-[#e8f7f3] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          Next
        </button>
      </div>
    </div>
  );
}