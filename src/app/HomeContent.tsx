"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { getAutoSlug } from "@/lib/autos";
import { MapPin, MessageCircle } from "lucide-react";

export default function HomeContent() {
  const searchParams = useSearchParams();

  const [autosDB, setAutosDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleAutos, setVisibleAutos] = useState(12);

  useEffect(() => {
    const fetchAutos = async () => {
      const { data, error } = await supabase
        .from("autos")
        .select("*")
        .order("precio_numero", { ascending: false });

      if (!error && data) {
        const autosFormateados = data.map((auto) => ({
          id: `db-${auto.id}`,
          marca: auto.marca,
          modelo: auto.modelo,
          anio: auto.anio,
          kmNumero: auto.km_numero ?? 0,
          km: auto.km,
          condicion: auto.condicion,
          precio: auto.precio,
          precioNumero:
            auto.moneda === "USD"
              ? (auto.precio_numero ?? 0) * 1500
              : auto.precio_numero ?? 0,
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
  const orden = searchParams.get("orden") || "precio-desc";

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
      return Number(a.precioNumero || 0) - Number(b.precioNumero || 0);
    }

    return Number(b.precioNumero || 0) - Number(a.precioNumero || 0);
  });

  const actualizarFiltro = (key: string, value: string) => {
    setVisibleAutos(12);

    const params = new URLSearchParams(searchParams.toString());

    if (
      value === "Todas" ||
      value === "Todos" ||
      value === "0" ||
      value === "999999" ||
      value === "precio-desc"
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();
    window.history.pushState(
      null,
      "",
      queryString ? `/?${queryString}#autos` : "/#autos"
    );
  };

  const limpiarFiltros = () => {
    setVisibleAutos(12);
    window.location.href = "/#autos";
  };

  const marcas = ["Todas", ...new Set(todosLosAutos.map((auto) => auto.marca))];
  const modelos = [
    "Todos",
    ...new Set(todosLosAutos.map((auto) => auto.modelo)),
  ];

  const filtroBox =
    "h-[88px] rounded-2xl border border-white/15 bg-black/25 px-5 py-4 text-left shadow-inner shadow-white/5 transition hover:border-white/25";
  const filtroLabel =
    "mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400";
  const filtroSelect =
    "w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-white outline-none";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      {/* HERO */}
      <section className="hero-premium">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-content apple-fade-slide">
          <p className="hero-eyebrow">HM EXCLUSIVOS</p>

          <h1 className="hero-title">
            Exclusividad, confianza y vehículos únicos
          </h1>

          <p className="hero-subtitle">
            Unidades premium seleccionadas bajo estándares de calidad, estética
            y confianza.
          </p>

          <div className="hero-buttons">
            <a href="#autos" className="hero-btn hero-btn-primary">
              Ver stock →
            </a>

            <a href="#contacto" className="hero-btn hero-btn-secondary">
              Contactar
            </a>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="premium-info-section">
        <div className="premium-info-container">
          <p className="premium-info-eyebrow">CONFIANZA Y EXPERIENCIA</p>

          <h2 className="premium-info-title">
            Una compra simple, segura y transparente
          </h2>

          <p className="premium-info-subtitle">
            Vehículos seleccionados, atención personalizada y un proceso pensado
            para que encuentres el auto ideal.
          </p>

          <div className="premium-info-grid">
            <div className="premium-info-card">
              <h3>Usados seleccionados</h3>
              <p>
                Cada unidad se revisa antes de ser publicada para ofrecer autos
                en excelente estado.
              </p>
            </div>

            <div className="premium-info-card">
              <h3>Atención personalizada</h3>
              <p>
                Te acompañamos durante todo el proceso para que encuentres el
                vehículo ideal de forma simple y transparente.
              </p>
            </div>

            <div className="premium-info-card">
              <h3>Tomamos permutas</h3>
              <p>
                Podés entregar tu vehículo como parte de pago y simplificar la
                operación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AUTOS */}
      <section
        id="autos"
        className="stock-section-bg relative overflow-hidden px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#4f6fe8]">
              Stock disponible
            </p>

            <h2 className="text-4xl font-bold">Autos destacados</h2>
          </div>

          {/* FILTROS PREMIUM */}
          <div className="mb-10 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="grid gap-4 lg:grid-cols-6">
              <div className={filtroBox}>
                <span className={filtroLabel}>Marca</span>
                <select
                  value={marca}
                  onChange={(e) => actualizarFiltro("marca", e.target.value)}
                  className={filtroSelect}
                >
                  {marcas.map((marca) => (
                    <option key={marca}>{marca}</option>
                  ))}
                </select>
              </div>

              <div className={filtroBox}>
                <span className={filtroLabel}>Modelo</span>
                <select
                  value={modelo}
                  onChange={(e) => actualizarFiltro("modelo", e.target.value)}
                  className={filtroSelect}
                >
                  {modelos.map((modelo) => (
                    <option key={modelo}>{modelo}</option>
                  ))}
                </select>
              </div>

              <div className={filtroBox}>
                <span className={filtroLabel}>Condición</span>
                <select
                  value={condicion}
                  onChange={(e) =>
                    actualizarFiltro("condicion", e.target.value)
                  }
                  className={filtroSelect}
                >
                  <option>Todas</option>
                  <option>Nuevo</option>
                  <option>Usado</option>
                </select>
              </div>

              <div className={filtroBox}>
                <span className={filtroLabel}>Kilómetros</span>
                <select
                  value={String(kmMax)}
                  onChange={(e) => actualizarFiltro("kmMax", e.target.value)}
                  className={filtroSelect}
                >
                  <option value="999999">Todos los km</option>
                  <option value="0">0 km</option>
                  <option value="30000">Hasta 30.000 km</option>
                  <option value="60000">Hasta 60.000 km</option>
                  <option value="100000">Hasta 100.000 km</option>
                </select>
              </div>

              <div className={filtroBox}>
                <span className={filtroLabel}>Año</span>
                <select
                  value={String(anioMin)}
                  onChange={(e) => actualizarFiltro("anioMin", e.target.value)}
                  className={filtroSelect}
                >
                  <option value="0">Todos los años</option>
                  <option value="2024">2024 en adelante</option>
                  <option value="2023">2023 en adelante</option>
                  <option value="2022">2022 en adelante</option>
                  <option value="2021">2021 en adelante</option>
                </select>
              </div>

              <div className={filtroBox}>
                <span className={filtroLabel}>Ordenar</span>
                <select
                  value={orden}
                  onChange={(e) => actualizarFiltro("orden", e.target.value)}
                  className={filtroSelect}
                >
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-neutral-400">
                Filtrá por marca, modelo, año, kilómetros y precio.
              </p>

              <button
                onClick={limpiarFiltros}
                className="text-left text-sm font-semibold text-[#4f6fe8] transition hover:text-white md:text-right"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <p className="mb-6 text-sm text-neutral-400">
            {loading
              ? "Cargando autos..."
              : `${autosOrdenados.length} auto(s) encontrados`}
          </p>

          {/* CARDS PREMIUM */}
          <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2">
            {autosOrdenados.slice(0, visibleAutos).map((auto) => (
              <div
                key={`${auto.id}`}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div className="relative h-[300px] overflow-hidden">
                  <img
                    src={auto.imagen}
                    alt={`${auto.marca} ${auto.modelo} ${auto.anio} en Córdoba`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="rounded-lg bg-[#4f6fe8] px-3 py-1 text-xs font-bold uppercase text-white shadow-lg">
                      {auto.condicion}
                    </span>

                    <span className="rounded-lg border border-white/15 bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {auto.anio}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex h-full flex-col justify-between space-y-3">
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6f85a3]">
                        {auto.marca}
                      </p>

                      <h3 className="min-h-[56px] text-[1.8rem] font-semibold leading-[1.02] tracking-tight text-white">
                        {auto.modelo}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[13px] text-neutral-400">
                      <span>{auto.anio}</span>

                      <span className="h-1 w-1 rounded-full bg-white/20" />

                      <span>{auto.km}</span>

                      {auto.transmision && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-white/20" />
                          <span>{auto.transmision}</span>
                        </>
                      )}

                      {auto.combustible && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-white/20" />
                          <span>{auto.combustible}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-auto pt-2">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                        Precio
                      </p>

                      <p className="mt-1 whitespace-nowrap text-[26px] font-semibold tracking-tight text-[#6f85e8]">
                        {auto.precio}
                      </p>
                    </div>

                    <a
                      href={`/autos/${getAutoSlug(auto)}`}
                      className="relative mt-4 flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7b92b8] transition hover:border-[#4f6fe8]/40 hover:bg-[#4f6fe8]/10 hover:text-white"
                    >
                      <span>Ver detalle</span>

                      <span className="absolute right-5 text-lg">→</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleAutos < autosOrdenados.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleAutos((prev) => prev + 12)}
                className="rounded-2xl border border-white/10 bg-[#1f3557] px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#284973]"
              >
                Ver más autos
              </button>
            </div>
          )}

          {!loading && autosOrdenados.length === 0 && (
            <p className="mt-10 text-center text-neutral-400">
              No encontramos autos con esos filtros.
            </p>
          )}
        </div>
      </section>

             {/* CONTACTO */}
      <section
        id="contacto"
        className="stock-section-bg border-t border-white/10 px-6 py-24"
      >
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#4f6fe8]">
              Contacto
            </p>

            <h2 className="text-4xl font-bold">
              ¿Querés consultar por un auto?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
              Escribinos y te asesoramos para encontrar la mejor opción según
              lo que estás buscando.
            </p>
          </div>

                    <div className="grid gap-6 md:grid-cols-3">
            {/* WHATSAPP */}
            <a
              href="https://wa.me/5493572538383"
              target="_blank"
              className="premium-card rounded-3xl p-8 transition duration-300 hover:-translate-y-1 hover:border-[#284973]"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.25em] text-[#4f6fe8]">
                  WhatsApp
                </p>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                </div>
              </div>

              <h3 className="text-2xl font-bold">
                Consultar ahora
              </h3>

              <p className="mt-4 text-neutral-400">
                Respuesta rápida para stock, precios y permutas.
              </p>
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/hmexclusivos"
              target="_blank"
              className="premium-card rounded-3xl p-8 transition duration-300 hover:-translate-y-1 hover:border-[#284973]"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.25em] text-[#4f6fe8]">
                  Instagram
                </p>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                    />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="0.8"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold">
                @hmexclusivos
              </h3>

              <p className="mt-4 text-neutral-400">
                Seguinos para ver ingresos, novedades y vehículos destacados.
              </p>
            </a>

            {/* UBICACION */}
            <a
              href="https://maps.google.com"
              target="_blank"
              className="premium-card rounded-3xl p-8 transition duration-300 hover:-translate-y-1 hover:border-[#284973]"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.25em] text-[#4f6fe8]">
                  Ubicación
                </p>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#284973]/30 bg-[#284973]/20">
                  <MapPin className="h-5 w-5 text-[#6f8fbd]" />
                </div>
              </div>

              <h3 className="text-2xl font-bold">
                Córdoba, Argentina
              </h3>

              <p className="mt-4 text-neutral-400">
                Coordiná una visita para conocer la unidad personalmente.
              </p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}