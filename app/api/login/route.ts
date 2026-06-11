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

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username.trim()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (userData.status !== true) {
      return NextResponse.json(
        { error: "Account inactive" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: userDoc.id,
        username: userData.username,
        email: userData.email || "",
        role: userData.role,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}