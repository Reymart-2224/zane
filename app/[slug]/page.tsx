import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function Storefront({ params }: { params: { slug: string } }) {
  const businessQuery = query(
    collection(db, "businesses"),
    where("slug", "==", params.slug)
  );

  const businessSnap = await getDocs(businessQuery);
  const business = businessSnap.docs[0]?.data();

  if (!business) return <h1>Not found</h1>;

  const productsSnap = await getDocs(collection(db, "products"));
  const products = productsSnap.docs.map((doc) => doc.data());

  const filtered = products.filter(p => p.businessId === businessSnap.docs[0].id);

  return (
    <div>
      <h1>{business.name}</h1>

      <h2>Products</h2>

      {filtered.map((p, i) => (
        <div key={i}>
          <h3>{p.title}</h3>
          <p>₱{p.price}</p>
        </div>
      ))}
    </div>
  );
}