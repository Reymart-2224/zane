"use client";

import { useState } from "react";

export default function ContactSubmitButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="submit"
      disabled={loading}
      onClick={() => setLoading(true)}
      className="w-full rounded-full bg-[#2f8c74] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#267762] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Sending...
        </span>
      ) : (
        "Send Message"
      )}
    </button>
  );
}