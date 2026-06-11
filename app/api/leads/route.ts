import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const clientId = searchParams.get("clientId");
    const listingId = searchParams.get("listingId");

    const leadsRef = collection(db, "leads");

    let q;

    if (clientId) {
      q = query(leadsRef, where("clientId", "==", clientId));
    } else if (listingId) {
      q = query(leadsRef, where("listingId", "==", listingId));
    } else {
      return NextResponse.json(
        { error: "Missing clientId or listingId" },
        { status: 400 }
      );
    }

    const snapshot = await getDocs(q);

    const leads = snapshot.docs
      .map((leadDoc) => ({
        id: leadDoc.id,
        ...leadDoc.data(),
      }))
      .sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Fetch leads error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch leads",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      listingId,
      listingTitle,
      companySlug,
      listingSlug,
      companyName,
      clientId,
      name,
      email,
      phone,
      message,
    } = body;

    if (!listingId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leadRef = await addDoc(collection(db, "leads"), {
      listingId,
      listingTitle: listingTitle || "",
      companySlug: companySlug || "",
      listingSlug: listingSlug || "",
      companyName: companyName || "",
      clientId: clientId || "",

      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : "",
      message: String(message).trim(),

      status: "new",
      source: "public_listing_contact_form",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      message: "Lead submitted successfully",
      leadId: leadRef.id,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to submit lead",
      },
      { status: 500 }
    );
  }
}