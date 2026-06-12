"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import zaneLogo from "@/assets/media/zane-logo-v3.png";

export default function ClientPortalLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/client-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("clientPortalUser", JSON.stringify(data.client));

      router.push("/portal/dashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#d8f3ff] via-[#edf9ff] to-white flex items-center justify-center px-4 text-[#111827]">
      <div className="absolute top-6 left-6 flex items-center gap-2">
         
      </div>

      <section className="w-full max-w-[390px] rounded-[28px] border border-white/80 bg-white/55 px-7 py-8 shadow-[0_24px_70px_rgba(41,101,137,0.18)] backdrop-blur-xl">
       
            <Image
              src={zaneLogo}
              alt="Zane IT Solutions"
              className="mx-auto mb-8 h-20 w-80 object-contain"
            />


        <div className="mb-6 text-center">
        
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Login to manage your listings and leads.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Username
            </label>
            <input
              type="text"
              value={username}
              required
              disabled={loading}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 w-full rounded-xl border border-white bg-white/80 px-4 text-sm text-[#111827] outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/15"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              required
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border border-white bg-white/80 px-4 text-sm text-[#111827] outline-none focus:border-[#296589] focus:ring-2 focus:ring-[#296589]/15"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-[#296589] text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className=" text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="font-bold text-[#296589]">Zane IT Solutions</span> <br></br>
          <small>Developed by Reymart Dungca</small>
        </p>
      </section>
    </main>
  );
}