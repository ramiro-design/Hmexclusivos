"use client";

import { autos } from "@/data/autos";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const sugerencias = autos.filter((auto) =>
    `${auto.marca} ${auto.modelo}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setShowSuggestions(true);
    router.push(`/?search=${value}#autos`);
  };

  const elegirSugerencia = (marca: string, modelo: string) => {
    const texto = `${marca} ${modelo}`;
    setSearch(texto);
    setShowSuggestions(false);
    router.push(`/?search=${texto}#autos`);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/35 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        
        {/* LOGO */}
        <img
          src="/logo.png"
          alt="HM Exclusivos"
          onClick={() => router.push("/")}
          className="h-10 cursor-pointer object-contain opacity-90 transition hover:opacity-100"
        />

        {/* BUSCADOR */}
        <div className="relative hidden w-full max-w-xs md:block">
          <input
            type="text"
            placeholder="Buscar auto..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm text-white placeholder:text-neutral-400 outline-none backdrop-blur-xl transition focus:border-red-500 focus:bg-white/15"
          />

          {showSuggestions && search.length > 0 && (
            <div className="absolute mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 shadow-2xl backdrop-blur-xl">
              {sugerencias.length > 0 ? (
                sugerencias.map((auto) => (
                  <button
                    key={auto.id}
                    onClick={() =>
                      elegirSugerencia(auto.marca, auto.modelo)
                    }
                    className="block w-full px-4 py-3 text-left text-sm transition hover:bg-red-600"
                  >
                    {auto.marca} {auto.modelo}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-neutral-400">
                  Sin resultados
                </p>
              )}
            </div>
          )}
        </div>

        {/* LINKS */}
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