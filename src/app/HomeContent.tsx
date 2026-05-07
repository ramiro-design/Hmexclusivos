"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { getAutoSlug } from "@/lib/autos";

export default function HomeContent() { 
  const searchParams = useSearchParams();

  const [autosDB, setAutosDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAutos = async () => {
      const { data, error } = await supabase
        .from("autos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const autosFormateados = data.map((auto) => ({
          id: `db-${auto.id}`,
          marca: auto.marca,
          modelo: auto.modelo,
          anio: auto.anio,
          kmNumero: auto.km_numero,
          km: auto.km,
          condicion: auto.condicion,
          precio: auto.precio,
          precioNumero: auto.precio_numero,
          combustible: auto.combustible,
          transmision: auto.transmision,
          imagen: auto.imagen,
          imagenes: auto.imagenes,
          descripcion: auto.descripcion,
        }));

        setAutosDB(autosFormateados);
      }

      setLoading(false);
    };

    fetchAutos();
  }, []);

  const todosLosAutos = autosDB;

  const search = searchParams.get("search") || "";
  const marca = searchParams.get("marca") || "Todas";
  const modelo = searchParams.get("modelo") || "Todos";
  const condicion = searchParams.get("condicion") || "Todas";
  const kmMax = Number(searchParams.get("kmMax") || 999999);
  const anioMin = Number(searchParams.get("anioMin") || 0);
  const orden = searchParams.get("orden") || "default";

  const autosFiltrados = todosLosAutos.filter((auto) => {
    const coincideBusqueda = `${auto.marca} ${auto.modelo}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      coincideBusqueda &&
      (marca === "Todas" || auto.marca === marca) &&
      (modelo === "Todos" || auto.modelo === modelo) &&
      (condicion === "Todas" || auto.condicion === condicion) &&
      auto.kmNumero <= kmMax &&
      auto.anio >= anioMin
    );
  });

  const autosOrdenados = [...autosFiltrados].sort((a, b) => {
    if (orden === "precio-asc") {
      return a.precioNumero - b.precioNumero;
    }

    if (orden === "precio-desc") {
      return b.precioNumero - a.precioNumero;
    }

    return 0;
  });

  const actualizarFiltro = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (
      value === "Todas" ||
      value === "Todos" ||
      value === "0" ||
      value === "999999" ||
      value === "default"
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    window.history.pushState(null, "", `/?${params.toString()}#autos`);
  };

  const limpiarFiltros = () => {
    window.location.href = "/#autos";
  };

  const marcas = ["Todas", ...new Set(todosLosAutos.map((auto) => auto.marca))];

  const modelos = [
    "Todos",
    ...new Set(todosLosAutos.map((auto) => auto.modelo)),
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
        <div className="absolute inset-0 bg-[url('/agencia.jpg')] bg-cover bg-center opacity-80" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-red-500">
            COLECCIÓN EXCLUSIVA
          </p>

          <h1 className="max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
           Exclusividad, confianza y vehículos únicos
          </h1>

          <p className="mt-6 max-w-xl text-lg text-neutral-300">
            Vehículos seleccionados bajo estándares de calidad, diseño y confianza.
            Te acompañamos en todo el proceso, de forma simple y transparente.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#autos"
              className="rounded-full bg-red-600 px-7 py-3 font-semibold transition hover:bg-red-700"
            >
              Ver stock
            </a>

            <a
              href="#beneficios"
              className="rounded-full border border-white/20 px-7 py-3 font-semibold transition hover:bg-white hover:text-black"
            >
              Por qué elegirnos
            </a>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-24">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-red-500">
          Confianza y experiencia
        </p>

        <h2 className="mb-10 text-4xl font-bold">
          Una compra simple, segura y transparente
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold">Usados seleccionados</h3>
            <p className="mt-3 text-neutral-400">
              Cada unidad se revisa antes de ser publicada para ofrecer autos en
              excelente estado.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold">Atención personalizada </h3>
            <p className="mt-3 text-neutral-400">
              Te acompañamos durante todo el proceso para 
              que encuentres el vehículo ideal de forma simple y transparente.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold">Tomamos permutas</h3>
            <p className="mt-3 text-neutral-400">
              Podés entregar tu vehículo como parte de pago y simplificar la
              operación.
            </p>
          </div>
        </div>
      </section>

      {/* AUTOS */}
      <section id="autos" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-red-500">
            Stock disponible
          </p>

          <h2 className="text-4xl font-bold">Autos destacados</h2>
        </div>

        <div className="mb-10 grid gap-4 rounded-3xl border border-white/10 bg-neutral-900 p-5 md:grid-cols-3">
          <select
            value={marca}
            onChange={(e) => actualizarFiltro("marca", e.target.value)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            {marcas.map((marca) => (
              <option key={marca}>{marca}</option>
            ))}
          </select>

          <select
            value={modelo}
            onChange={(e) => actualizarFiltro("modelo", e.target.value)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            {modelos.map((modelo) => (
              <option key={modelo}>{modelo}</option>
            ))}
          </select>

          <select
            value={condicion}
            onChange={(e) => actualizarFiltro("condicion", e.target.value)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            <option>Todas</option>
            <option>Nuevo</option>
            <option>Usado</option>
          </select>

          <select
            value={String(kmMax)}
            onChange={(e) => actualizarFiltro("kmMax", e.target.value)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            <option value="999999">Todos los km</option>
            <option value="0">0 km</option>
            <option value="30000">Hasta 30.000 km</option>
            <option value="60000">Hasta 60.000 km</option>
            <option value="100000">Hasta 100.000 km</option>
          </select>

          <select
            value={String(anioMin)}
            onChange={(e) => actualizarFiltro("anioMin", e.target.value)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            <option value="0">Todos los años</option>
            <option value="2024">2024 en adelante</option>
            <option value="2023">2023 en adelante</option>
            <option value="2022">2022 en adelante</option>
            <option value="2021">2021 en adelante</option>
          </select>

          <select
            value={orden}
            onChange={(e) => actualizarFiltro("orden", e.target.value)}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            <option value="default">Ordenar por precio</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>

          <button
            onClick={limpiarFiltros}
            className="rounded-xl border border-white/20 px-4 py-3 font-semibold transition hover:bg-white hover:text-black md:col-span-3"
          >
            Limpiar filtros
          </button>
        </div>

        <p className="mb-6 text-sm text-neutral-400">
          {loading
            ? "Cargando autos..."
            : `${autosOrdenados.length} auto(s) encontrados`}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {autosOrdenados.map((auto) => (
            <div
              key={`${auto.id}`}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 transition hover:-translate-y-2 hover:border-red-500/50"
            >
              <div className="overflow-hidden">
                <img
                  src={auto.imagen}
                  alt={`${auto.marca} ${auto.modelo} ${auto.anio} en Córdoba`}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-5">
                <div className="mb-3 flex gap-2">
                  <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                    {auto.condicion}
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {auto.anio}
                  </span>
                </div>

                <h3 className="text-2xl font-bold">
                  {auto.marca} {auto.modelo}
                </h3>

                <p className="mt-2 text-sm text-neutral-400">{auto.km}</p>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xl font-bold">{auto.precio}</p>

                  <a
                    href={`/autos/${getAutoSlug(auto)}`}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-700"
                  >
                    Ver detalle
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && autosOrdenados.length === 0 && (
          <p className="mt-10 text-center text-neutral-400">
            No encontramos autos con esos filtros.
          </p>
        )}
      </section>

      {/* CONTACTO */}
      <section
        id="contacto"
        className="border-t border-white/10 bg-black px-6 py-20"
      >
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-red-500">
            Contacto
          </p>

          <h2 className="text-4xl font-bold">¿Querés consultar por un auto?</h2>

          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            Escribinos y te asesoramos para encontrar la mejor opción según lo
            que estás buscando.
          </p>

          <a
            href="https://wa.me/5493572538383"
            target="_blank"
            className="mt-8 inline-block rounded-full bg-green-600 px-8 py-4 font-bold transition hover:bg-green-700"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}