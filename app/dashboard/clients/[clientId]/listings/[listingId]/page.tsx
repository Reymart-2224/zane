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
  companySlug?: string;
  title: string;
  listingSlug?: string;
  listingCategory?: "property" | "product";
  type?: string;
  address?: string;
  price?: string;
  status?: string;
  description?: string;
  featuredImage?: string;
  sliderImages?: string[];
};

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = params.clientId as string;
  const listingId = params.listingId as string;

  const MAX_IMAGE_SIZE_MB = 3;
  const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/listings/${listingId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load listing");
        return;
      }

      const loadedListing = data.listing;

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

      setFeaturedImageFile(null);
      setSliderImageFiles([]);
      setFeaturedPreview("");
      setSliderPreviews([]);
    } catch (err) {
      console.error(err);
      setError("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

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

    if (!listing) return;

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

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          companyName: listing.companyName,
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
      await fetchListing();
    } catch (err) {
      console.error(err);
      setError("Failed to update listing or upload images.");
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const deleteListing = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This will also delete its uploaded images."
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete listing");
        return;
      }

      router.push(`/dashboard/clients/${clientId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to delete listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[22px] border border-[#ecf6f4] bg-white p-6 shadow-sm sm:rounded-[28px] sm:p-8">
        <p className="text-gray-400">Loading listing...</p>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="rounded-[22px] border border-[#ecf6f4] bg-white p-6 shadow-sm sm:rounded-[28px] sm:p-8">
        <p className="text-red-500">{error}</p>

        <Link
          href={`/dashboard/clients/${clientId}`}
          className="mt-5 inline-flex rounded-full bg-[#2f8c74] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#277763]"
        >
          Back to Client
        </Link>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="w-full max-w-full space-y-5 overflow-hidden">
      <section className="rounded-[22px] border border-[#ecf6f4] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="text-sm font-semibold text-[#2f8c74] hover:underline"
        >
          ← Back to Client
        </Link>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold text-[#1d2b35]">
              {listing.title}
            </h1>

            <p className="mt-1 break-all text-sm text-gray-400">
              Public URL: /{listing.companySlug}/{listing.listingSlug}
            </p>
          </div>

          {listing.companySlug && listing.listingSlug && (
            <Link
              href={`/${listing.companySlug}/${listing.listingSlug}`}
              target="_blank"
              className="w-full rounded-full bg-[#2f8c74] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#277763] sm:w-auto"
            >
              View Public Page
            </Link>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-[#d9f3ed] bg-[#e8f7f3] px-5 py-3 text-sm text-[#2f8c74]">
          {success}
        </div>
      )}

      <section className="rounded-[22px] border border-[#ecf6f4] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <form onSubmit={updateListing} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
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
                className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
              >
                <option value="property">Property</option>
                <option value="product">Product</option>
              </select>
            </div>

            <Field
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
            />

            <Field
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
                className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <Field
              label="Address / Location"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">
              Description
            </label>

            <div className="overflow-hidden rounded-xl border border-[#d9f3ed] bg-white">
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

          <div className="rounded-[22px] border border-[#d9f3ed] bg-[#f6fbfa] p-4 sm:p-5">
            <h2 className="text-lg font-bold text-[#1d2b35]">
              Update Images
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Upload new images only when you want to replace the current ones.
            </p>

            <div className="mt-5 space-y-6">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Featured Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                  className="mt-2 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
                />

                <p className="mt-1 text-[11px] text-gray-400">
                  Upload a new image to replace the current featured image.
                  Maximum file size: {MAX_IMAGE_SIZE_MB}MB
                </p>

                {(featuredPreview || listing.featuredImage) && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-500">
                      {featuredPreview ? "New Preview" : "Current Featured Image"}
                    </p>

                    <img
                      src={featuredPreview || listing.featuredImage}
                      alt={listing.title}
                      className="h-52 w-full max-w-md rounded-2xl border border-[#d9f3ed] object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Slider Images
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSliderImagesChange}
                  className="mt-2 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
                />

                <p className="mt-1 text-[11px] text-gray-400">
                  Uploading new slider images will replace the current slider
                  images. Maximum file size per image: {MAX_IMAGE_SIZE_MB}MB
                </p>

                {sliderPreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-500">
                      New Slider Preview
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {sliderPreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`New Slider Preview ${index + 1}`}
                          className="h-28 w-full rounded-2xl border border-[#d9f3ed] object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sliderPreviews.length === 0 &&
                  Array.isArray(listing.sliderImages) &&
                  listing.sliderImages.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs font-semibold text-gray-500">
                        Current Slider Images
                      </p>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {listing.sliderImages.map((image, index) => (
                          <img
                            key={`${image}-${index}`}
                            src={image}
                            alt={`Slider ${index + 1}`}
                            className="h-28 w-full rounded-2xl border border-[#d9f3ed] object-cover"
                          />
                        ))}
                      </div>
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
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={deleteListing}
              disabled={saving}
              className="w-full rounded-full border border-red-100 bg-red-50 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Please wait..." : "Delete Listing"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-[#2f8c74] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#277763] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving
                ? uploadingImages
                  ? "Uploading images..."
                  : "Updating..."
                : "Update Listing"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-11 w-full rounded-xl border border-[#d9f3ed] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2f8c74]/20"
      />
    </div>
  );
}