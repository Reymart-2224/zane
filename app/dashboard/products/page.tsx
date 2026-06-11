"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Products() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const addProduct = async () => {
    await addDoc(collection(db, "products"), {
      title,
      price,
      businessId: "replace-with-business-id",
      createdAt: new Date(),
    });

    alert("Product added!");
  };

  return (
    <div>
      <h1>Add Product</h1>

      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} />

      <button onClick={addProduct}>Add</button>
    </div>
  );
}