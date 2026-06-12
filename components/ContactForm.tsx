"use client";

import { useState } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);
    setFormMessage("");

    try {
      const formData = new FormData(form);

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormMessage("success");
        form.reset();
      } else {
        setFormMessage(result.message || "error");
      }
    } catch (error) {
      console.error("Form submit error:", error);
      setFormMessage("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {formMessage === "success" && (
        <div className="mb-5 rounded-2xl border border-[#2f8c74]/40 bg-[#2f8c74]/15 px-5 py-4 text-sm font-semibold text-[#8ff0d1]">
          Message sent successfully. I’ll get back to you soon.
        </div>
      )}

      {formMessage === "error" && (
        <div className="mb-5 rounded-2xl border border-red-400/40 bg-red-500/15 px-5 py-4 text-sm font-semibold text-red-200">
          Something went wrong. Please try again or message me directly.
        </div>
      )}

      {formMessage === "missing-fields" && (
        <div className="mb-5 rounded-2xl border border-yellow-400/40 bg-yellow-500/15 px-5 py-4 text-sm font-semibold text-yellow-100">
          Please complete all required fields.
        </div>
      )}

      {formMessage === "config-error" && (
        <div className="mb-5 rounded-2xl border border-red-400/40 bg-red-500/15 px-5 py-4 text-sm font-semibold text-red-200">
          Email configuration error. Please check Vercel environment variables.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Your name"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#2f8c74] focus:ring-2 focus:ring-[#2f8c74]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#2f8c74] focus:ring-2 focus:ring-[#2f8c74]/20"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="Your phone number"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#2f8c74] focus:ring-2 focus:ring-[#2f8c74]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Service Needed
            </label>
            <select
              name="service"
              required
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none focus:border-[#2f8c74] focus:ring-2 focus:ring-[#2f8c74]/20"
            >
              <option value="" className="text-black">
                Select service
              </option>
              <option value="Web Development" className="text-black">
                Web Development
              </option>
              <option value="IT Automation" className="text-black">
                IT Automation
              </option>
              <option value="Dashboard/System" className="text-black">
                Dashboard/System
              </option>
              <option value="Cloud Solutions" className="text-black">
                Cloud Solutions
              </option>
              <option value="Support & Maintenance" className="text-black">
                Support & Maintenance
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-white/70">
            Project Details
          </label>
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Tell us about your project..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#2f8c74] focus:ring-2 focus:ring-[#2f8c74]/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
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

        <p className="text-center text-xs leading-6 text-white/40">
          You can also contact us directly through WhatsApp, phone, or email.
        </p>
      </form>
    </>
  );
}