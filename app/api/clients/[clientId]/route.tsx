import { NextResponse } from "next/server";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type RouteParams = {
  params: Promise<{
    id?: string;
    clientId?: string;
  }>;
};

function normalize(value: string) {
  return String(value || "").trim().toLowerCase();
}

async function getClientId(request: Request, params: RouteParams["params"]) {
  const resolvedParams = await params;

  const paramId = resolvedParams.id || resolvedParams.clientId;

  if (paramId) {
    return paramId;
  }

  // fallback from URL: /api/clients/CLIENT_ID
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  return parts[parts.length - 1] || "";
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const clientId = await getClientId(request, params);

    console.log("GET CLIENT ID:", clientId);

    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientData = clientSnap.data();
    const { password, ...safeClientData } = clientData;

    return NextResponse.json({
      client: {
        id: clientSnap.id,
        ...safeClientData,
      },
    });
  } catch (error) {
    console.error("Fetch client error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch client",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const clientId = await getClientId(request, params);

    console.log("PATCH CLIENT ID:", clientId);

    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const body = await request.json();

    const company_name = String(body.company_name || "").trim();
    const contact_name = String(body.contact_name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const facebookMessenger = String(body.facebookMessenger || "").trim();

    // ✅ Added Facebook Page ID
    const facebookPageId = String(body.facebookPageId || "").trim();
const logoUrl = String(body.logoUrl || "").trim();
const listingBg = String(body.listingBg || "").trim();
const headerColor = String(body.headerColor || "#ffffff").trim() || "#ffffff";
const headerTextColor =
  String(body.headerTextColor || "#1d2b35").trim() || "#1d2b35";
const buttonColor =
  String(body.buttonColor || "#296589").trim() || "#296589";
    if (!company_name || !contact_name || !email) {
      return NextResponse.json(
        { error: "Company name, contact name, and email are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientsRef = collection(db, "clients");

    const cleanEmailLower = normalize(email);
    const cleanCompanyNameLower = normalize(company_name);

    /**
     * Duplicate email checker
     */
    const emailLowerQuery = query(
      clientsRef,
      where("emailLower", "==", cleanEmailLower)
    );

    const emailLowerSnapshot = await getDocs(emailLowerQuery);

    const emailLowerExists = emailLowerSnapshot.docs.some(
      (clientDoc) => clientDoc.id !== clientId
    );

    if (emailLowerExists) {
      return NextResponse.json(
        { error: "Email already exists. Please use another email." },
        { status: 409 }
      );
    }

    /**
     * Fallback checker for old records without emailLower
     */
    const emailQuery = query(clientsRef, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);

    const emailExists = emailSnapshot.docs.some(
      (clientDoc) => clientDoc.id !== clientId
    );

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already exists. Please use another email." },
        { status: 409 }
      );
    }

    /**
     * Duplicate company name checker
     */
    const companyLowerQuery = query(
      clientsRef,
      where("companyNameLower", "==", cleanCompanyNameLower)
    );

    const companyLowerSnapshot = await getDocs(companyLowerQuery);

    const companyLowerExists = companyLowerSnapshot.docs.some(
      (clientDoc) => clientDoc.id !== clientId
    );

    if (companyLowerExists) {
      return NextResponse.json(
        { error: "Company name already exists. Please use another name." },
        { status: 409 }
      );
    }

    /**
     * Fallback checker for old records without companyNameLower
     */
    const companyQuery = query(
      clientsRef,
      where("company_name", "==", company_name)
    );

    const companySnapshot = await getDocs(companyQuery);

    const companyExists = companySnapshot.docs.some(
      (clientDoc) => clientDoc.id !== clientId
    );

    if (companyExists) {
      return NextResponse.json(
        { error: "Company name already exists. Please use another name." },
        { status: 409 }
      );
    }

 await updateDoc(clientRef, {
  company_name,
  companyNameLower: cleanCompanyNameLower,

  contact_name,

  email,
  emailLower: cleanEmailLower,

  phone,
  address,

  facebookMessenger,
  facebookPageId,

  logoUrl,
  listingBg,

  headerColor,
  headerTextColor,
  buttonColor,

  updatedAt: serverTimestamp(),
});
    const updatedSnap = await getDoc(clientRef);
    const updatedData = updatedSnap.data() || {};
    const { password, ...safeUpdatedData } = updatedData;

    return NextResponse.json({
      message: "Client updated successfully",
      client: {
        id: updatedSnap.id,
        ...safeUpdatedData,
      },
    });
  } catch (error) {
    console.error("Update client error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update client",
      },
      { status: 500 }
    );
  }
}