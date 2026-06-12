"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import zaneLogo from "@/assets/media/zane-logo-v3.png";
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
      
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-80px] left-[-80px] w-[420px] h-[180px] bg-white/80 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[520px] h-[220px] bg-white/90 rounded-full blur-3xl" />
        <div className="absolute top-[38%] left-[10%] w-[260px] h-[120px] bg-white/40 rounded-full blur-2xl" />
        <div className="absolute top-[32%] right-[12%] w-[320px] h-[130px] bg-white/50 rounded-full blur-2xl" />
      </div>

      <section className="relative z-10 w-full max-w-[360px] rounded-[28px] bg-white/45 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(31,80,120,0.18)] px-7 py-8">
        <Image
              src={zaneLogo}
              alt="Zane IT Solutions"
              className="mx-auto mb-8 h-20 w-80 object-contain"
            />



        <div className="text-center mb-6">
        
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
            className="mt-2 h-12 w-full rounded-xl bg-[#296589] text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

         <p className="mt-6 text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="font-bold text-[#296589]">Zane IT Solutions</span> <br></br>
          <small>Developed by Reymart Dungca</small>
        </p>
      </section>
    </main>
  );
}