"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (value: string) => {
    setSearch(value);
    router.push(`/?search=${encodeURIComponent(value)}#autos`);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/35 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <img
          src="/logo.png"
          alt="HM Exclusivos"
          onClick={() => router.push("/")}
          className="h-10 cursor-pointer object-contain opacity-90 transition hover:opacity-100"
        />

        <div className="relative hidden w-full max-w-xs md:block">
          <input
            type="text"
            placeholder="Buscar auto..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm text-white placeholder:text-neutral-400 outline-none backdrop-blur-xl transition focus:border-red-500 focus:bg-white/15"
          />
        </div>

        <div className="flex gap-6 text-sm text-neutral-300">
          <a href="/" className="transition hover:text-white">
            Inicio
          </a>
          <a href="/#autos" className="transition hover:text-white">
            Autos
          </a>
          <a href="/#contacto" className="transition hover:text-white">
            Contacto
          </a>
        </div>
      </div>
    </nav>
  );
}