"use client";

import { useRouter } from "next/navigation";
import { login } from "./api/auth";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/dashboard")
      const user = await getUser();
      console.log(user.data);
    } catch (error) {
      console.error("Login failed:", error.response.data);
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
        <h3 className="text-lg text-[#667085] text-center">
          Silakan memasukkan akun anda
        </h3>

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
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 text-[#48505E]">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target
                .value)}
              type="password"
              id="password"
              name="password"
              placeholder="Masukkan Password"
              required
              className="border px-3 py-2 rounded-lg border-[#667085]"
            />
          </div>

          <button
            type="submit"
            className="bg-[#1366D9] text-white py-2 px-4 mt-5 rounded-lg hover:bg-blue-500 font-bold"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
