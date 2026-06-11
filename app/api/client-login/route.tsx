import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing username or password" },
        { status: 400 }
      );
    }

    const clientsRef = collection(db, "clients");

    const q = query(
      clientsRef,
      where("username", "==", String(username).trim())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const clientDoc = snapshot.docs[0];
    const clientData = clientDoc.data();

    const passwordMatch = await bcrypt.compare(
      String(password),
      clientData.password || ""
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (clientData.status === false) {
      return NextResponse.json(
        { error: "Account inactive" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      client: {
        id: clientDoc.id,
        company_name: clientData.company_name || "",
        contact_name: clientData.contact_name || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        address: clientData.address || "",
        username: clientData.username || "",
        role: "client",
      },
    });
  } catch (error) {
    console.error("Client login error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}