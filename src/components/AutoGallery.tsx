"use client";

import { useState } from "react";

export default function AutoGallery({
  imagenes,
  alt,
}: {
  imagenes: string[];
  alt: string;
}) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(imagenes[0]);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
        <img
          src={imagenSeleccionada}
          alt={alt}
          className="h-[460px] w-full object-cover"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {imagenes.slice(0, 6).map((imagen) => (
          <button
            key={imagen}
            onClick={() => setImagenSeleccionada(imagen)}
            className={`overflow-hidden rounded-2xl border-2 transition ${
              imagenSeleccionada === imagen
                ? "border-[#284973]"
                : "border-transparent hover:border-white/20"
            }`}
          >
            <img
              src={imagen}
              alt={alt}
              className="h-28 w-full object-cover transition hover:opacity-80"
            />
          </button>
        ))}
      </div>
    </div>
  );
}