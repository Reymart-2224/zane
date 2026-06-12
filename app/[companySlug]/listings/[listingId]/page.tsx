"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

type Listing = {
  id: string;
  clientId: string;
  companyName?: string;
  title?: string;
  listingCategory?: "property" | "product";
  type?: string;
  address?: string;
  price?: string;
  status?: string;
  description?: string;
  featuredImage?: string;
  sliderImages?: string[];
};

type ClientPortalUser = {
  id: string;
  company_name: string;
};

export default function PortalEditListingPage() {
  const params = useParams();
  const router = useRouter();

  const listingId = params.listingId as string;

  const MAX_IMAGE_SIZE_MB = 3;
  const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  const [client, setClient] = useState<ClientPortalUser | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [sliderImageFiles, setSliderImageFiles] = useState<File[]>([]);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const [sliderPreviews, setSliderPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    listingCategory: "property",
    type: "",
    address: "",
    price: "",
    status: "active",
    description: "",
  });

  useEffect(() => {
    const storedClient = localStorage.getItem("clientPortalUser");

    if (!storedClient) {
      router.replace("/portal");
      return;
    }

    try {
      const parsedClient = JSON.parse(storedClient) as ClientPortalUser;

      if (!parsedClient?.id) {
        localStorage.removeItem("clientPortalUser");
        router.replace("/portal");
        return;
      }

      setClient(parsedClient);
      fetchListing(parsedClient.id);
    } catch {
      localStorage.removeItem("clientPortalUser");
      router.replace("/portal");
    }
  }, [router, listingId]);

  const fetchListing = async (clientId: string) => {
    try {
      setChecking(true);
      setError("");

      const res = await fetch(`/api/listings/${listingId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load listing");
        return;
      }

      const loadedListing = data.listing as Listing;

      if (loadedListing.clientId !== clientId) {
        setError("You do not have permission to edit this listing.");
        return;
      }

      setListing(loadedListing);

      setForm({
        title: loadedListing.title || "",
        listingCategory: loadedListing.listingCategory || "property",
        type: loadedListing.type || "",
        address: loadedListing.address || "",
        price: loadedListing.price || "",
        status: loadedListing.status || "active",
        description: loadedListing.description || "",
      });

      setFeaturedPreview("");
      setSliderPreviews([]);
      setFeaturedImageFile(null);
      setSliderImageFiles([]);
    } catch (err) {
      console.error(err);
      setError("Failed to load listing");
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const updateListing = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listing || !client) return;

    setError("");
    setSuccess("");
    setSaving(true);
    setUploadingImages(true);

    try {
      let featuredImage = listing.featuredImage || "";
      let sliderImages = Array.isArray(listing.sliderImages)
        ? listing.sliderImages
        : [];

      if (featuredImageFile) {
        featuredImage = await uploadImageFile(
          featuredImageFile,
          `clients/${client.id}/featured`
        );
      }

      if (sliderImageFiles.length > 0) {
        sliderImages = await Promise.all(
          sliderImageFiles.map((file) =>
            uploadImageFile(file, `clients/${client.id}/slider`)
          )
        );
      }

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: client.company_name,
          ...form,
          featuredImage,
          sliderImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update listing");
        return;
      }

      setSuccess("Listing updated successfully.");

      await fetchListing(client.id);
    } catch (err) {
      console.error(err);
      setError("Failed to update listing.");
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <p className="text-sm font-semibold text-[#296589]">
          Loading listing...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/portal/dashboard"
              className="text-sm font-semibold text-[#296589] hover:underline"
            >
              ← Back to Portal
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-[#1d2b35]">
              Edit Listing
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1120px] px-4 py-8">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm text-[#296589]">
            {success}
          </div>
        )}

        {listing && (
          <form
            onSubmit={updateListing}
            className="rounded-[28px] border border-[#ecf6f4] bg-white p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Category
                </label>
                <select
                  name="listingCategory"
                  value={form.listingCategory}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="property">Property</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <InputField
                label="Type"
                name="type"
                value={form.type}
                onChange={handleChange}
              />

              <InputField
                label="Price"
                name="price"
                value={form.price}
                onChange={handleChange}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">
                  Description
                </label>

                <div className="overflow-hidden rounded-xl border border-blue-100 bg-white">
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        description: value,
                      }))
                    }
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
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />

                <p className="text-[11px] text-gray-400">
                  Upload a new image to replace the current featured image.
                  Maximum file size: {MAX_IMAGE_SIZE_MB}MB
                </p>

                {(featuredPreview || listing.featuredImage) && (
                  <img
                    src={featuredPreview || listing.featuredImage}
                    alt={listing.title || "Featured image"}
                    className="mt-3 h-52 w-full max-w-md rounded-2xl border border-blue-100 object-cover"
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
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />

                <p className="text-[11px] text-gray-400">
                  Uploading new slider images will replace the current slider
                  images. Maximum file size per image: {MAX_IMAGE_SIZE_MB}MB
                </p>

                {sliderPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {sliderPreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`New Slider Preview ${index + 1}`}
                        className="h-28 w-full rounded-2xl border border-blue-100 object-cover"
                      />
                    ))}
                  </div>
                )}

                {sliderPreviews.length === 0 &&
                  Array.isArray(listing.sliderImages) &&
                  listing.sliderImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {listing.sliderImages.map((image, index) => (
                        <img
                          key={`${image}-${index}`}
                          src={image}
                          alt={`Current Slider Image ${index + 1}`}
                          className="h-28 w-full rounded-2xl border border-blue-100 object-cover"
                        />
                      ))}
                    </div>
                  )}

                {sliderPreviews.length === 0 &&
                  (!Array.isArray(listing.sliderImages) ||
                    listing.sliderImages.length === 0) && (
                    <p className="mt-3 text-sm text-gray-400">
                      No slider images uploaded yet.
                    </p>
                  )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#296589] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? uploadingImages
                    ? "Uploading images..."
                    : "Updating..."
                  : "Update Listing"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-gray-500">
          
          </p>

           <p className=" text-xs text-gray-400">
          Powered by{" "}
          <span className="font-bold text-[#296589]">Zane IT Solutions</span> <br></br>
          <small>Developed by Reymart Dungca</small>
        </p>
        </div>
      </footer>

    </main>
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
        className="h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}