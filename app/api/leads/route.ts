import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanPhone = phone ? String(phone).trim() : "";
    const cleanMessage = String(message).trim();

    let clientEmail = "";
    let clientName = companyName || "Client";

    if (clientId) {
      const clientSnap = await getDoc(doc(db, "clients", clientId));

      if (clientSnap.exists()) {
        const clientData = clientSnap.data();

        clientEmail = clientData.email || "";
        clientName =
          clientData.company_name ||
          clientData.contact_name ||
          companyName ||
          "Client";
      }
    }

    const leadRef = await addDoc(collection(db, "leads"), {
      listingId,
      listingTitle: listingTitle || "",
      companySlug: companySlug || "",
      listingSlug: listingSlug || "",
      companyName: companyName || "",
      clientId: clientId || "",

      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,

      status: "new",
      source: "public_listing_contact_form",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");

      return NextResponse.json({
        message: "Lead submitted successfully, but email was not sent.",
        leadId: leadRef.id,
        emailSent: false,
      });
    }

    if (!clientEmail) {
      console.error("Client email not found for clientId:", clientId);

      return NextResponse.json({
        message: "Lead submitted successfully, but client email was not found.",
        leadId: leadRef.id,
        emailSent: false,
      });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

    const listingUrl =
      companySlug && listingSlug
        ? `${siteUrl}/${companySlug}/${listingSlug}`
        : siteUrl;

    const safeClientName = escapeHtml(clientName);
    const safeCompanyName = escapeHtml(companyName || clientName);
    const safeListingTitle = escapeHtml(listingTitle || "Listing Inquiry");
    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safePhone = escapeHtml(cleanPhone || "Not provided");
    const safeMessage = escapeHtml(cleanMessage).replaceAll("\n", "<br />");

    const { error: emailError } = await resend.emails.send({
      from:
        process.env.LEAD_EMAIL_FROM ||
        "Zane Listings <onboarding@resend.dev>",
      to: [clientEmail],
      bcc: process.env.ADMIN_EMAIL_TO ? [process.env.ADMIN_EMAIL_TO] : [],
      replyTo: cleanEmail,
      subject: `New inquiry for ${listingTitle || "your listing"}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New Listing Inquiry</h2>

          <p>Hello ${safeClientName},</p>

          <p>You received a new inquiry from your listing page.</p>

          <hr />

          <p><strong>Company:</strong> ${safeCompanyName}</p>
          <p><strong>Listing:</strong> ${safeListingTitle}</p>
          <p><strong>Listing URL:</strong> <a href="${listingUrl}">${listingUrl}</a></p>

          <hr />

          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>

          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend lead email error:", emailError);

      return NextResponse.json({
        message: "Lead submitted successfully, but email failed to send.",
        leadId: leadRef.id,
        emailSent: false,
      });
    }

    return NextResponse.json({
      message: "Lead submitted successfully",
      leadId: leadRef.id,
      emailSent: true,
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