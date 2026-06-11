"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
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
      const res = await fetch("/api/login", {
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
        setLoading(false);
        return;
      }

      const user = data.user;

      if (!user || !user.role) {
        setError("Invalid user data returned from login");
        setLoading(false);
        return;
      }

      localStorage.clear();
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-white flex items-center justify-center px-4">
      <div className="absolute top-6 left-8 flex items-center gap-2 text-black font-semibold text-sm">
        <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs">
          Z
        </div>
        <span>Zane</span>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-80px] left-[-80px] w-[420px] h-[180px] bg-white/80 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[520px] h-[220px] bg-white/90 rounded-full blur-3xl" />
        <div className="absolute top-[38%] left-[10%] w-[260px] h-[120px] bg-white/40 rounded-full blur-2xl" />
        <div className="absolute top-[32%] right-[12%] w-[320px] h-[130px] bg-white/50 rounded-full blur-2xl" />
      </div>

      <section className="relative z-10 w-full max-w-[360px] rounded-[28px] bg-white/45 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(31,80,120,0.18)] px-7 py-8">
        <div className="mx-auto mb-5 w-12 h-12 rounded-2xl bg-white/80 border border-white shadow-sm flex items-center justify-center">
          <span className="text-xl">↪</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-950">
            Admin Login
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Sign in using your admin username and password.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            className="w-full h-11 rounded-xl bg-white/75 border border-white/80 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-sky-300"
          />

          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="w-full h-11 rounded-xl bg-white/75 border border-white/80 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-sky-300"
          />

          {error && (
            <p className="text-center text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gray-950 text-white text-sm font-medium shadow-lg hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}