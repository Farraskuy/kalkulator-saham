"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import AppLogo from "@/components/layout/AppLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        setError(
          data.error || "Login gagal. Periksa kembali email dan password.",
        );
      }
    } catch {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-0 sm:px-6 transition-colors duration-300">
      <div className="w-full min-h-screen sm:min-h-fit sm:max-w-[420px] bg-card rounded-none sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-center">
        <div>
          <div className="mb-4">
            <AppLogo size={44} />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-main">
            Admin Panel Login
          </h1>
          <p className="text-xs text-muted mt-1.5 mb-6">
            Masuk untuk mengatur fraksi harga BEI dan persentase ARA/ARB.
          </p>

          {error && (
            <div className="bg-sub-pink text-acc-pink p-3.5 rounded-xl text-xs font-bold mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-[10px] font-bold text-muted uppercase tracking-wider block"
              >
                Email Admin
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  className="w-full bg-page  rounded-xl pl-10 pr-4 py-3 text-main text-sm font-semibold outline-none focus:border-acc-blue focus:ring-2 focus:ring-acc-blue/10 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-pass"
                className="text-[10px] font-bold text-muted uppercase tracking-wider block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-pass"
                  type="password"
                  className="w-full bg-page  rounded-xl pl-10 pr-4 py-3 text-main text-sm font-semibold outline-none focus:border-acc-blue focus:ring-2 focus:ring-acc-blue/10 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-all duration-200  shadow-acc-blue/15 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
