import { NextResponse } from "next/server";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const clientsRef = collection(db, "clients");
    const q = query(clientsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Fetch clients error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch clients",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    if (!company_name || !contact_name || !email || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    const clientsRef = collection(db, "clients");

    const usernameQuery = query(
      clientsRef,
      where("username", "==", cleanUsername)
    );
    const usernameSnapshot = await getDocs(usernameQuery);

    if (!usernameSnapshot.empty) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const emailQuery = query(clientsRef, where("email", "==", cleanEmail));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const docRef = await addDoc(clientsRef, {
      company_name: company_name.trim(),
      contact_name: contact_name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      username: cleanUsername,
      password: hashedPassword,
      role: "client",
      status: status === false ? false : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      message: "Client created successfully",
      clientId: docRef.id,
    });
  } catch (error) {
    console.error("Create client error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create client",
      },
      { status: 500 }
    );
  }
}