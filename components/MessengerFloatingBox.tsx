"use client";

import { useEffect, useState } from "react";

type MessengerFloatingBoxProps = {
  messengerUsername?: string;
  companyName?: string;
};

export default function MessengerFloatingBox({
  messengerUsername,
  companyName = "us",
}: MessengerFloatingBoxProps) {
  const [minimized, setMinimized] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const isDesktop = window.innerWidth >= 768;

      // Desktop = open by default
      // Mobile = minimized by default
      setMinimized(!isDesktop);
      setReady(true);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  if (!messengerUsername || !ready) return null;

  const messengerUrl = `https://m.me/${messengerUsername}`;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        aria-label="Open chat box"
        className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-[0_12px_35px_rgba(0,132,255,0.35)] transition hover:scale-105 hover:bg-[#0077e6]"
      >
        <MessengerIcon />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_18px_55px_rgba(15,45,58,0.25)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#143747] to-[#296589] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0084ff] text-white">
            <MessengerIcon />
          </div>

          <div>
            <p className="text-sm font-bold leading-tight">Messenger Chat</p>
            <p className="text-xs text-white/75">Usually replies soon</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          aria-label="Minimize chat box"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg font-bold leading-none transition hover:bg-white/20"
        >
          −
        </button>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-5">
        <p className="text-sm leading-relaxed text-gray-600">
          Hi! Interested in this listing? Message {companyName} directly on
          Facebook Messenger.
        </p>

        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#0084ff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0077e6]"
        >
          <MessengerIconSmall />
          Talk to me on Messenger
        </a>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="mt-3 w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
        >
          Minimize
        </button>
      </div>
    </div>
  );
}

function MessengerIcon() {
  return (
    <svg
      className="h-7 w-7 fill-current"
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M120 0C53.7 0 0 49.8 0 111.2c0 35 17.5 66.3 44.8 86.7V240l40.9-22.4c10.9 3 22.4 4.7 34.3 4.7 66.3 0 120-49.8 120-111.2S186.3 0 120 0zm11.9 149.8l-30.5-32.5-59.5 32.5 65.4-69.4 31.3 32.5 58.7-32.5-65.4 69.4z" />
    </svg>
  );
}

function MessengerIconSmall() {
  return (
    <svg
      className="h-5 w-5 fill-current"
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M120 0C53.7 0 0 49.8 0 111.2c0 35 17.5 66.3 44.8 86.7V240l40.9-22.4c10.9 3 22.4 4.7 34.3 4.7 66.3 0 120-49.8 120-111.2S186.3 0 120 0zm11.9 149.8l-30.5-32.5-59.5 32.5 65.4-69.4 31.3 32.5 58.7-32.5-65.4 69.4z" />
    </svg>
  );
} 