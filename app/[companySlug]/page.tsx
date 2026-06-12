import Link from "next/link";
import type { Metadata } from "next";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type PageProps = {
  params: Promise<{
    companySlug: string;
  }>;
  searchParams?: Promise<{
    q?: string;
    category?: string;
    type?: string;
    min?: string;
    max?: string;
    sort?: string;
  }>;
};

type Listing = {
  id: string;
  clientId?: string;
  companyName?: string;
  companySlug?: string;
  listingSlug?: string;
  title?: string;
  listingCategory?: string;
  type?: string;
  address?: string;
  price?: string;
  status?: string;
  description?: string;
  featuredImage?: string;
  sliderImages?: string[];
  beds?: string;
  baths?: string;
  area?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  };
};

type Client = {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

function formatSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function stripHtml(html?: string) {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function getPriceNumber(price?: string) {
  if (!price) return 0;

  const cleanPrice = String(price).replace(/[^\d.]/g, "");
  const priceNumber = Number(cleanPrice);

  return Number.isFinite(priceNumber) ? priceNumber : 0;
}

function formatPeso(price?: string) {
  if (!price) return "Contact";

  const cleanPrice = String(price).trim();

  if (cleanPrice.startsWith("₱")) {
    return cleanPrice;
  }

  return `₱${cleanPrice}`;
}

function buildQueryString(
  currentParams: Record<string, string>,
  updates: Record<string, string>
) {
  const params = new URLSearchParams();

  Object.entries({
    ...currentParams,
    ...updates,
  }).forEach(([key, value]) => {
    if (value && value !== "all") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { companySlug } = await params;

  const listingsQuery = query(
    collection(db, "listings"),
    where("companySlug", "==", companySlug),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(listingsQuery);

  const listings = snapshot.docs.map((listingDoc) => ({
    ...(listingDoc.data() as Listing),
    id: listingDoc.id,
  }));

  let client: Client | null = null;

  const clientId = listings[0]?.clientId;

  if (clientId) {
    const clientSnap = await getDoc(doc(db, "clients", clientId));

    if (clientSnap.exists()) {
      client = clientSnap.data() as Client;
    }
  }

  const companyName =
    client?.company_name || listings[0]?.companyName || formatSlug(companySlug);

  const companyAddress = client?.address || listings[0]?.address || "";

  const featuredImage =
    listings.find((listing) => listing.featuredImage)?.featuredImage || "";

  const listingCount = listings.length;

  const pageTitle = `${companyName} Listings | Zane Listings`;

  const pageDescription =
    listingCount > 0
      ? `Explore ${listingCount} active listing${
          listingCount === 1 ? "" : "s"
        } from ${companyName}${
          companyAddress ? ` in ${companyAddress}` : ""
        }. View available properties, prices, locations, and details.`
      : `View listings from ${companyName}. Browse available properties, locations, prices, and contact details.`;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

  const pageUrl = `${siteUrl}/${companySlug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: "Zane Listings",
      type: "website",
      images: featuredImage
        ? [
            {
              url: featuredImage,
              width: 1200,
              height: 630,
              alt: `${companyName} listings`,
            },
          ]
        : [],
    },
    twitter: {
      card: featuredImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description: pageDescription,
      images: featuredImage ? [featuredImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function CompanyListingsPage({
  params,
  searchParams,
}: PageProps) {
  const { companySlug } = await params;
  const filters = (await searchParams) || {};

  const keyword = filters.q || "";
  const categoryFilter = filters.category || "all";
  const typeFilter = filters.type || "all";
  const minPrice = filters.min || "";
  const maxPrice = filters.max || "";
  const sortBy = filters.sort || "newest";

  const listingsQuery = query(
    collection(db, "listings"),
    where("companySlug", "==", companySlug),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(listingsQuery);

  const listings = snapshot.docs.map((listingDoc) => ({
    ...(listingDoc.data() as Listing),
    id: listingDoc.id,
  }));

  let client: Client | null = null;

  const clientId = listings[0]?.clientId;

  if (clientId) {
    const clientSnap = await getDoc(doc(db, "clients", clientId));

    if (clientSnap.exists()) {
      client = clientSnap.data() as Client;
    }
  }

  const companyName =
    client?.company_name || listings[0]?.companyName || formatSlug(companySlug);

  const companyPhone = client?.phone || "";
  const companyEmail = client?.email || "";
  const companyAddress = client?.address || "";

  const categories = Array.from(
    new Set(
      listings
        .map((listing) => listing.listingCategory)
        .filter(Boolean) as string[]
    )
  );

  const types = Array.from(
    new Set(listings.map((listing) => listing.type).filter(Boolean) as string[])
  );

  const currentParams = {
    q: keyword,
    category: categoryFilter,
    type: typeFilter,
    min: minPrice,
    max: maxPrice,
    sort: sortBy,
  };

  const filteredListings = listings
    .filter((listing) => {
      const searchValue = keyword.toLowerCase().trim();

      const matchesKeyword =
        !searchValue ||
        listing.title?.toLowerCase().includes(searchValue) ||
        listing.address?.toLowerCase().includes(searchValue) ||
        listing.type?.toLowerCase().includes(searchValue) ||
        stripHtml(listing.description).toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        listing.listingCategory === categoryFilter;

      const matchesType = typeFilter === "all" || listing.type === typeFilter;

      const listingPrice = getPriceNumber(listing.price);

      const matchesMin =
        !minPrice || listingPrice >= Number(String(minPrice).replace(/\D/g, ""));

      const matchesMax =
        !maxPrice || listingPrice <= Number(String(maxPrice).replace(/\D/g, ""));

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesType &&
        matchesMin &&
        matchesMax
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return getPriceNumber(a.price) - getPriceNumber(b.price);
      }

      if (sortBy === "price-high") {
        return getPriceNumber(b.price) - getPriceNumber(a.price);
      }

      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;

      return bTime - aTime;
    });

  return (
    <main className="flex min-h-screen flex-col bg-[#f8fafc] text-[#111827] listings">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1120px] px-4 py-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#111827] md:text-4xl">
                {companyName}
              </h1>

              {companyAddress && (
                <p className="mt-2 flex max-w-xl items-start gap-2 text-sm leading-relaxed text-gray-500">
                  <MapPinIcon />
                  <span>{companyAddress}</span>
                </p>
              )}
            </div>

            <div className="w-full rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 md:w-auto md:min-w-[340px]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Contact Details
              </p>

              <div className="space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-500">Phone</span>

                  {companyPhone ? (
                    <a
                      href={`tel:${companyPhone}`}
                      className="text-sm font-semibold text-[#296589] hover:underline"
                    >
                      {companyPhone}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">Not available</span>
                  )}
                </div>

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-500">Email</span>

                  {companyEmail ? (
                    <a
                      href={`mailto:${companyEmail}`}
                      className="break-all text-sm font-semibold text-[#296589] hover:underline"
                    >
                      {companyEmail}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">Not available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Listings */}
      <section className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-10">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Our Listings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Explore available listings from {companyName}.
            </p>
          </div>

          <span className="w-fit rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#296589] shadow-sm">
            {filteredListings.length} result
            {filteredListings.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Filters - hidden by default */}
<details className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-[#296589]">
    <span>Filter Listings</span>

    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#296589]">
      Show / Hide
    </span>
  </summary>

  <form method="GET" className="border-t border-gray-100 p-4">
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <label className="mb-1 block text-xs font-semibold text-gray-500">
          Search
        </label>
        <input
          type="text"
          name="q"
          defaultValue={keyword}
          placeholder="Search title, location, type..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/10"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">
          Category
        </label>
        <select
          name="category"
          defaultValue={categoryFilter}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/10"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {formatSlug(category)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">
          Type
        </label>
        <select
          name="type"
          defaultValue={typeFilter}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/10"
        >
          <option value="all">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">
          Min Price
        </label>
        <input
          type="number"
          name="min"
          defaultValue={minPrice}
          placeholder="Min"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/10"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">
          Max Price
        </label>
        <input
          type="number"
          name="max"
          defaultValue={maxPrice}
          placeholder="Max"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/10"
        />
      </div>
    </div>

    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">
          Sort
        </label>
        <select
          name="sort"
          defaultValue={sortBy}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/10"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-[#296589] px-6 text-sm font-semibold text-white transition hover:opacity-90 md:w-auto"
        >
          Apply Filters
        </button>
      </div>

      <div className="flex items-end">
        <Link
          href={`/${companySlug}`}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-[#296589] transition hover:bg-blue-50 md:w-auto"
        >
          Reset
        </Link>
      </div>
    </div>
  </form>
</details>

        {listings.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-bold text-[#111827]">
              No listings found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              This company does not have active listings yet.
            </p>
          </div>
        )}

        {listings.length > 0 && filteredListings.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-bold text-[#111827]">
              No matching listings
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filter options.
            </p>

            <Link
              href={`/${companySlug}`}
              className="mt-5 inline-flex rounded-full bg-[#296589] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Clear Filters
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => {
            const excerpt = stripHtml(listing.description).slice(0, 95);

            return (
              <Link
                key={listing.id}
                href={`/${listing.companySlug}/${listing.listingSlug}`}
                className="mx-auto block w-full max-w-[350px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-[220px] bg-gray-100">
                  {listing.featuredImage ? (
                    <img
                      src={listing.featuredImage}
                      alt={listing.title || "Listing image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                      No Image
                    </div>
                  )}

                  {listing.listingCategory && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold capitalize text-[#296589] shadow-sm">
                      {listing.listingCategory}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-[#111827]">
                        {listing.title}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-gray-500">
                        <MapPinIcon />

                        <span className="truncate">
                          {listing.address || "Location not specified"}
                        </span>
                      </p>
                    </div>

                    <p className="shrink-0 text-base font-bold text-[#111827]">
                      {formatPeso(listing.price)}
                    </p>
                  </div>

                  {excerpt && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
                      {excerpt}
                      {excerpt.length >= 95 ? "..." : ""}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-500">
                      {listing.type || "Listing"}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#296589]">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>

          <p className="text-sm font-medium text-gray-500">
            Powered by{" "}
            <span className="font-bold text-[#296589]">Zane Listings</span>
          </p>
        </div>
      </footer>
    </main>
  );
}

function MapPinIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--zl-primary)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}