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
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase";

type RouteParams = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const clientData = clientSnap.data();

    return NextResponse.json({
      client: {
        id: clientSnap.id,
        ...clientData,
        password: undefined,
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
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const body = await request.json();

    const {
      company_name,
      contact_name,
      email,
      phone,
      address,
      username,
      password,
      status,
    } = body;

    if (!company_name || !contact_name || !email || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    const clientsRef = collection(db, "clients");

    const usernameQuery = query(
      clientsRef,
      where("username", "==", cleanUsername)
    );

    const usernameSnapshot = await getDocs(usernameQuery);

    const usernameExists = usernameSnapshot.docs.some(
      (clientDoc) => clientDoc.id !== clientId
    );

    if (usernameExists) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const emailQuery = query(clientsRef, where("email", "==", cleanEmail));
    const emailSnapshot = await getDocs(emailQuery);

    const emailExists = emailSnapshot.docs.some(
      (clientDoc) => clientDoc.id !== clientId
    );

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const updateData: Record<string, unknown> = {
      company_name: company_name.trim(),
      contact_name: contact_name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      username: cleanUsername,
      status: status === false ? false : true,
      updatedAt: serverTimestamp(),
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await updateDoc(clientRef, updateData);

    return NextResponse.json({
      message: "Client updated successfully",
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