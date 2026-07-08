"use client";

import { useState } from "react";

type ListingLeadFormProps = {
  listingId: string;
  listingTitle?: string;
  companySlug?: string;
  listingSlug?: string;
  companyName?: string;
  clientId?: string;
  headerBackground?: string;
  headerTextColor?: string;
  buttonColor?: string;
};

export default function ListingLeadForm({
  listingId,
  listingTitle,
  companySlug,
  listingSlug,
  companyName,
  clientId,
  headerBackground = "#296589",
  headerTextColor = "#ffffff",
  buttonColor = "#296589",
}: ListingLeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    listingTitle ? `I am interested in ${listingTitle}.` : ""
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const submitLead = async (event: React.FormEvent) => {
    event.preventDefault();

    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit inquiry");
        return;
      }

      setSuccess("Your inquiry has been sent successfully.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage(listingTitle ? `I am interested in ${listingTitle}.` : "");
    } catch (err) {
      console.error(err);
      setError("Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitLead}
      className="mt-6 rounded-2xl border border-white/20 p-5 shadow-lg"
      style={{
        background: headerBackground,
        color: headerTextColor,
      }}
    >
      <h3 className="text-[18px] font-bold">Send Inquiry</h3>

      <p className="mt-1 text-sm opacity-85">
        Fill out the form below and we will get back to you.
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold">
            Name *
          </label>

          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#111827] outline-none focus:border-[var(--zl-primary)]"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Email *
          </label>

          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#111827] outline-none focus:border-[var(--zl-primary)]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Phone
          </label>

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#111827] outline-none focus:border-[var(--zl-primary)]"
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Message *
          </label>

          <textarea
            value={message}
            required
            rows={5}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[var(--zl-primary)]"
            placeholder="Write your message..."
          />
        </div>
      </div>

      {success && (
        <p className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
  type="submit"
  disabled={loading}
  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
  style={{
    color: headerBackground.includes("gradient") ? buttonColor : headerBackground,
  }}
>
  {loading ? "Sending..." : "Submit Inquiry"}
</button>
    </form>
  );
}