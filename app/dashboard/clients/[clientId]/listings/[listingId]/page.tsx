"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    listingCategory: "property",
    type: "",
    address: "",
    price: "",
    status: "active",
    description: "",
  });
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

  const updateListing = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          companyName: listing?.companyName,
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
      setError("Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[28px] bg-white p-8 shadow-sm border border-[#ecf6f4]">
        <p className="text-gray-400">Loading listing...</p>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="rounded-[28px] bg-white p-8 shadow-sm border border-[#ecf6f4]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-6 shadow-sm border border-[#ecf6f4]">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="text-sm font-semibold text-[#2563eb] hover:underline"
        >
          ← Back to Client
        </Link>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1d2b35]">
              {listing.title}
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Public URL: /{listing.companySlug}/{listing.listingSlug}
            </p>
          </div>

          {listing.companySlug && listing.listingSlug && (
            <Link
              href={`/${listing.companySlug}/${listing.listingSlug}`}
              target="_blank"
              className="rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
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
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-600">
          {success}
        </div>
      )}

      <section className="rounded-[28px] bg-white p-6 shadow-sm border border-[#ecf6f4]">
        <form onSubmit={updateListing} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
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
                className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
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

            <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
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

          {listing.featuredImage && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Featured Image
              </p>
              <img
                src={listing.featuredImage}
                alt={listing.title}
                className="h-52 w-full max-w-md rounded-2xl object-cover border border-blue-100"
              />
            </div>
          )}

          {listing.sliderImages && listing.sliderImages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Slider Images
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {listing.sliderImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Slider ${index + 1}`}
                    className="h-28 w-full rounded-2xl object-cover border border-blue-100"
                  />
                ))}
              </div>
            </div>
          )}

       <div className="flex items-center justify-between gap-3">
  <button
    type="submit"
    disabled={saving}
    className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed transition"
  >
    {saving ? "Updating..." : "Update Listing"}
  </button>

  <button
    type="button"
    onClick={deleteListing}
    disabled={saving}
    className="rounded-full bg-red-50 border border-red-100 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
  >
    {saving ? "Please wait..." : "Delete Listing"}
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
        className="w-full h-11 rounded-xl bg-white border border-blue-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}