"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }

    router.push("/admin");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-8">
        <h1 className="text-3xl font-bold">Ingresar al admin</h1>

        <input
          type="email"
          placeholder="Email"
          className="mt-8 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="mt-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="mt-6 w-full rounded-full bg-red-600 px-6 py-4 font-bold hover:bg-red-700"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}