"use client";

import { useRouter } from "next/navigation";
import { login, getUser } from "./api/auth";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      setLoading(true);

      const user = await getUser();
      console.log(user.data);

      router.push("/dashboard");
    } catch (err) {
      console.log("Login failed:", err.response);
      setError("Login gagal. Periksa email dan password Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center h-screen">
      <section className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
        <img
          src="/icons/logo-sn-textless.svg"
          alt="logo"
          className="w-20 h-20"
        />

        <h1 className="text-3xl font-bold text-center">Selamat Datang!</h1>
        {!loading && (
          <h3 className="text-lg text-[#667085] text-center">
            Silakan memasukkan akun anda
          </h3>
        )}

        {error && (
          <div className="text-red-600 font-medium text-sm">{error}</div>
        )}

        {loading ? (
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-2 bg-blue-500 animate-pulse w-full"></div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full gap-4 p-4"
          >
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-[#48505E]">
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                name="email"
                placeholder="Masukkan Username"
                required
                className="border px-3 py-2 rounded-lg border-[#667085]"
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col relative">
              <label htmlFor="password" className="mb-1 text-[#48505E]">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Masukkan Password"
                required
                className="border px-3 py-2 rounded-lg border-[#667085] pr-10"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1366D9] text-white py-2 px-4 mt-5 rounded-lg hover:bg-blue-500 font-bold disabled:opacity-50"
            >
              {submitting ? "Memproses..." : "Login"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
