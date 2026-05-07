"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 z-50 w-full px-4 pt-4">
      <div className="glass-navbar mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-7 py-4">
        
        {/* LOGO */}
<button
  onClick={() => router.push("/")}
  className="flex cursor-pointer items-center"
  aria-label="Ir al inicio"
>
<div className="pl-6">
  <div className="relative h-16 w-40 scale-200">
    <Image
      src="/logo-hm-este.png"
      alt="HM Exclusivos"
      fill
      sizes="200px"
      className="object-contain object-left"
      priority
    />
  </div>
</div>
</button>

        {/* LINKS */}
        <div className="hidden items-center gap-14 md:flex">
          <a href="/" className="navbar-link navbar-link-active">
            Inicio
          </a>

          <a href="/#autos" className="navbar-link">
            Stock
          </a>

          <a href="/#beneficios" className="navbar-link">
            Nosotros
          </a>

          <a href="/#contacto" className="navbar-link">
            Contacto
          </a>
        </div>

        {/* WHATSAPP */}
        <a
          href="https://wa.me/5493572538383"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-whatsapp"
        >
          <span className="text-lg">☏</span>
          <span>WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}