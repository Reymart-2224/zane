import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import MessengerChatBox from "@/components/MessengerChatBox";
import MessengerFloatingBox from "@/components/MessengerFloatingBox";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ListingImageZoom from "@/components/ListingImageZoom";
import ListingLeadForm from "@/components/ListingLeadForm";
type PageProps = {
  params: Promise<{
    companySlug: string;
    listingSlug: string;
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
};

type Client = {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  facebookMessenger?: string;
  facebookPageId?: string;
  logoUrl?: string;  
   listingBg?: string;
  headerColor?: string;
  headerTextColor?: string;
  buttonColor?: string;
};
function formatPeso(price?: string) {
  if (!price) return "";

  const cleanPrice = String(price).trim();

  if (cleanPrice.startsWith("₱")) {
    return cleanPrice;
  }

  return `₱${cleanPrice}`;
}

function stripHtml(html?: string) {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { companySlug, listingSlug } = await params;

  const listingQuery = query(
    collection(db, "listings"),
    where("companySlug", "==", companySlug),
    where("listingSlug", "==", listingSlug),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(listingQuery);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const pageUrl = `${siteUrl}/${companySlug}/${listingSlug}`;

  if (snapshot.empty) {
    return {
      title: "Listing Not Found | Zane Listings",
      description: "The listing you are looking for is no longer available.",
      alternates: {
        canonical: pageUrl,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const listing = {
    ...(snapshot.docs[0].data() as Listing),
    id: snapshot.docs[0].id,
  };

  let client: Client | null = null;

  if (listing.clientId) {
    const clientSnap = await getDoc(doc(db, "clients", listing.clientId));

    if (clientSnap.exists()) {
      client = clientSnap.data() as Client;
    }
  }

  const companyName =
    client?.company_name || listing.companyName || "Company Listings";

  const title = listing.title || "Listing";

  const price = listing.price ? formatPeso(listing.price) : "";
  const address = listing.address || client?.address || "";
  const category = listing.listingCategory || listing.type || "listing";

  const cleanText = stripHtml(listing.description);

  const pageTitle = `${title} | ${companyName}`;

  const pageDescription = cleanText
    ? cleanText.slice(0, 155)
    : `${title} is an active ${category} from ${companyName}${
        address ? ` located at ${address}` : ""
      }${price ? ` with price ${price}` : ""}. View details, photos, and contact information.`;

  const featuredImage =
    listing.featuredImage ||
    (Array.isArray(listing.sliderImages) ? listing.sliderImages[0] : "");

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
      type: "article",
      images: featuredImage
        ? [
            {
              url: featuredImage,
              width: 1200,
              height: 630,
              alt: title,
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

export default async function PublicListingPage({ params }: PageProps) {
  const { companySlug, listingSlug } = await params;

  const listingQuery = query(
    collection(db, "listings"),
    where("companySlug", "==", companySlug),
    where("listingSlug", "==", listingSlug),
    where("status", "==", "active")
  );

  const snapshot = await getDocs(listingQuery);

  if (snapshot.empty) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 text-[#111827]">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Listing not found</h1>

          <Link
            href={`/${companySlug}`}
            className="mt-4 block font-semibold text-[var(--zl-primary)] hover:underline"
          >
            Back to listings
          </Link>
        </div>
      </main>
    );
  }

  const listing = {
    ...(snapshot.docs[0].data() as Listing),
    id: snapshot.docs[0].id,
  };

  let client: Client | null = null;

  if (listing.clientId) {
    const clientSnap = await getDoc(doc(db, "clients", listing.clientId));

    if (clientSnap.exists()) {
      client = clientSnap.data() as Client;
    }
  }

  const companyName =
    client?.company_name || listing.companyName || "Company Listings";

 const companyPhone = client?.phone || "";
const companyEmail = client?.email || "";
const companyAddress = client?.address || "";
const facebookMessenger = client?.facebookMessenger || "";
const facebookPageId = client?.facebookPageId || "";

const companyLogo = client?.logoUrl || "";

const headerBackground =
  client?.headerColor ||
  "linear-gradient(135deg, #0f2d3a, #296589, #1d4f63)";

const headerTextColor = client?.headerTextColor || "#ffffff";
const buttonColor = client?.buttonColor || "#296589";
const listingBackground = client?.listingBg || "";
const brandStyles = {
  "--zl-primary": buttonColor,
  "--zl-primary-light": `${buttonColor}18`,
  "--zl-header-text": headerTextColor,
} as CSSProperties;
  const galleryImages = [
    ...(listing.featuredImage ? [listing.featuredImage] : []),
    ...(Array.isArray(listing.sliderImages) ? listing.sliderImages : []),
  ];


  
const pageStyles = {
  ...brandStyles,
  ...(listingBackground
    ? {
        backgroundImage: ` linear-gradient(rgb(255 255 255 / 67%), rgb(255 255 255)), url(${listingBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }
    : {}),
} as CSSProperties;
  return (
  <main className="flex min-h-screen flex-col bg-[white] to-white  text-[#111827] listings"   style={pageStyles}>
    {/* Header */}
       <header
  className="border-b border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.25),0_12px_35px_rgba(0,0,0,0.14)]"
  style={{
    background: headerBackground,
    color: headerTextColor,
  }}
>
  <div className="mx-auto max-w-[1120px] px-4 py-6">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <Link
          href={`/${companySlug}`}
          className="mb-4 inline-flex text-sm font-semibold opacity-90 transition hover:underline hover:opacity-100"
        > 
          ← Back to listings 
        </Link> 

        {companyLogo ? (
          <img
            src={companyLogo}
            alt={`${companyName} logo`}
            className="w-auto max-w-[291px] object-contain"
          />
        ) : (
          <>
            <h1 className="text-3xl font-bold md:text-4xl">
              {companyName}
            </h1>

            {companyAddress && (
              <p className="mt-3 flex max-w-xl items-start gap-2 text-sm leading-relaxed opacity-90">
                <MapPinIcon />
                <span>{companyAddress}</span>
              </p>
            )}
          </>
        )}
      </div>

      <div className="w-full md:w-auto md:min-w-[340px]">
        <div className="rounded-2xl border border-current/20 bg-white/10 p-4 backdrop-blur-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide opacity-80">
            Contact Details
          </p>

          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm opacity-80">Phone</span>

              {companyPhone ? (
                <a
                  href={`tel:${companyPhone}`}
                  className="text-sm font-semibold transition hover:underline"
                >
                  {companyPhone}
                </a>
              ) : (
                <span className="text-sm opacity-60">Not available</span>
              )}
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm opacity-80">Email</span>

              {companyEmail ? (
                <a
                  href={`mailto:${companyEmail}`}
                  className="break-all text-sm font-semibold transition hover:underline"
                >
                  {companyEmail}
                </a>
              ) : (
                <span className="text-sm opacity-60">Not available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

    {/* Listing Content */}
<section className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-8 md:py-10">
  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
    {/* Left: Gallery + Details + Description */}
    <div className="min-w-0 space-y-8">
      <ListingImageZoom images={galleryImages} title={listing.title} />

      <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-[black] px-3 py-1 text-xs font-semibold capitalize text-[white]">
            {listing.listingCategory || "listing"}
          </span>

          {listing.type && (
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {listing.type}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-[#111827] md:text-4xl">
          {listing.title}
        </h1>

        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-500">
          <MapPinIcon />
          <span>{listing.address || "No location"}</span>
        </p>

        {listing.price && (
          <div className="mt-6 rounded-2xl bg-[#f8fafc] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-black">
              Price
            </p>

            <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-black">
              <PesoIcon />
              <span>{formatPeso(listing.price).replace("₱", "")}</span>
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {companyPhone && (
            <a
              href={`tel:${companyPhone}`}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-[#296589] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Call Now
            </a>
          )}

          {companyEmail && (
            <a
              href={`mailto:${companyEmail}`}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#296589] bg-white px-5 py-3 text-sm font-semibold text-[#296589] transition hover:bg-[#1d4e6d] hover:text-white"
            >
              Email
            </a>
          )}
        </div>
      </aside>

      {/* Description */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h3 className="text-xl font-bold text-[#111827]">More Information</h3>

        <div
          className="zl-wysiwyg-content mt-5"
          dangerouslySetInnerHTML={{
            __html: cleanDescription(listing.description),
          }}
        />
      </div>
    </div>

    {/* Right: Lead Form */}
    <div className="lg:sticky lg:top-6">
      <ListingLeadForm
  listingId={listing.id}
  listingTitle={listing.title}
  companySlug={companySlug}
  listingSlug={listingSlug}
  companyName={companyName}
  clientId={listing.clientId}
  headerBackground={headerBackground}
  headerTextColor={headerTextColor}
  buttonColor={buttonColor}
/>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>

           <p className=" text-xs text-gray-400">
          Powered by{" "}
          <span className="font-bold text-[#296589]">Zane IT Solutions</span> <br></br>
          <small>Developed by Reymart Dungca</small>
        </p>
        </div>
      </footer>
   <MessengerChatBox pageId={facebookPageId} />

   {facebookMessenger && (
<MessengerFloatingBox
  messengerUsername={facebookMessenger}
  companyName={companyName}
/>
)}
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

function PesoIcon() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full  text-xl font-bold text-[black]">
      ₱
    </span>
  );
}
function cleanDescription(html?: string) {
  if (!html) return "<p>No description available.</p>";

  return html
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/<p><br><\/p>/gi, '<div class="zl-empty-line"></div>')
    .replace(/<p><br \/><\/p>/gi, '<div class="zl-empty-line"></div>')
    .replace(/<p>\s*<\/p>/gi, '<div class="zl-empty-line"></div>')
    .replace(/background-color:\s*rgb\(255,\s*255,\s*255\);?/gi, "")
    .replace(/color:\s*rgb\(64,\s*64,\s*64\);?/gi, "");
}