"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const createBusiness = async () => {
    if (!auth.currentUser) return;

    await addDoc(collection(db, "businesses"), {
      name,
      slug,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
    });

    alert("Business created!");
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <input placeholder="Business Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Slug (url name)" onChange={(e) => setSlug(e.target.value)} />

      <button onClick={createBusiness}>Create Business</button>
    </div>
  );
}