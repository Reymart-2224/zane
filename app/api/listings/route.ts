import { NextResponse } from "next/server";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slugify";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const clientId = searchParams.get("clientId");
    const companySlug = searchParams.get("companySlug");

    const listingsRef = collection(db, "listings");

    let q;

    if (clientId) {
      q = query(listingsRef, where("clientId", "==", clientId));
    } else if (companySlug) {
      q = query(listingsRef, where("companySlug", "==", companySlug));
    } else {
      return NextResponse.json(
        { error: "Missing clientId or companySlug" },
        { status: 400 }
      );
    }

    const snapshot = await getDocs(q);

    const listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Fetch listings error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch listings",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      clientId,
      companyName,
      title,
      listingCategory,
      type,
      address,
      price,
      status,
      description,
      featuredImage,
      sliderImages,
    } = await request.json();

    if (!clientId || !companyName || !title || !listingCategory) {
      return NextResponse.json(
        { error: "Missing required listing fields" },
        { status: 400 }
      );
    }

    const companySlug = slugify(companyName);
    const listingSlug = slugify(title);

    const listingsRef = collection(db, "listings");

    const docRef = await addDoc(listingsRef, {
      clientId,
      companyName,
      companySlug,
      title: title.trim(),
      listingSlug,
      listingCategory: listingCategory || "property",
      type: type?.trim() || "",
      address: address?.trim() || "",
      price: price || "",
      status: status || "active",
      description: description || "",
      featuredImage: featuredImage || "",
      sliderImages: Array.isArray(sliderImages) ? sliderImages : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      message: "Listing created successfully",
      listingId: docRef.id,
      companySlug,
      listingSlug,
    });
  } catch (error) {
    console.error("Create listing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create listing",
      },
      { status: 500 }
    );
  }
}