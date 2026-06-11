import { NextResponse } from "next/server";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { slugify } from "@/lib/slugify";

type RouteParams = {
  params: Promise<{
    listingId: string;
  }>;
};

async function deleteStorageFileFromUrl(fileUrl?: string) {
  if (!fileUrl) return;

  try {
    const decodedUrl = decodeURIComponent(fileUrl);

    /**
     * Firebase download URL format:
     * https://firebasestorage.googleapis.com/v0/b/BUCKET/o/clients%2FclientId%2Ffeatured%2Fimage.png?alt=media&token=...
     */
    const match = decodedUrl.match(/\/o\/(.+?)\?/);

    if (!match || !match[1]) {
      console.warn("Could not extract storage path from URL:", fileUrl);
      return;
    }

    const filePath = match[1];
    const fileRef = ref(storage, filePath);

    await deleteObject(fileRef);
  } catch (error) {
    console.warn("Failed to delete storage file:", error);
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      );
    }

    const listingRef = doc(db, "listings", listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      listing: {
        id: listingSnap.id,
        ...listingSnap.data(),
      },
    });
  } catch (error) {
    console.error("Fetch listing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch listing",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
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
    } = body;

    if (!title || !listingCategory) {
      return NextResponse.json(
        { error: "Missing required listing fields" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      title: title.trim(),
      listingSlug: slugify(title),
      listingCategory,
      type: type?.trim() || "",
      address: address?.trim() || "",
      price: price || "",
      status: status || "active",
      description: description || "",
      updatedAt: serverTimestamp(),
    };

    if (companyName) {
      updateData.companyName = companyName.trim();
      updateData.companySlug = slugify(companyName);
    }

    if (featuredImage !== undefined) {
      updateData.featuredImage = featuredImage;
    }

    if (Array.isArray(sliderImages)) {
      updateData.sliderImages = sliderImages;
    }

    const listingRef = doc(db, "listings", listingId);
    await updateDoc(listingRef, updateData);

    return NextResponse.json({
      message: "Listing updated successfully",
    });
  } catch (error) {
    console.error("Update listing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update listing",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      );
    }

    const listingRef = doc(db, "listings", listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const listingData = listingSnap.data();

    // Delete featured image
    await deleteStorageFileFromUrl(listingData.featuredImage);

    // Delete slider images
    if (Array.isArray(listingData.sliderImages)) {
      await Promise.all(
        listingData.sliderImages.map((imageUrl: string) =>
          deleteStorageFileFromUrl(imageUrl)
        )
      );
    }

    // Delete Firestore document
    await deleteDoc(listingRef);

    return NextResponse.json({
      message: "Listing and images deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete listing",
      },
      { status: 500 }
    );
  }
}