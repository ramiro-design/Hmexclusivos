import AutoGallery from "@/components/AutoGallery";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { getAutoSlug } from "@/lib/autos";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

function getIdFromSlug(slug: string) {
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  return Number(id);
}

async function getAutoBySlug(slug: string) {
  const dbId = getIdFromSlug(slug);

  if (!dbId) return null;

  const { data } = await supabase
    .from("autos")
    .select("*")
    .eq("id", dbId)
    .single();

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const auto = await getAutoBySlug(slug);

  if (!auto) {
    return {
      title: "Auto no encontrado | HM Exclusivos",
    };
  }

  const title = `${auto.marca} ${auto.modelo} ${auto.anio} usado en Córdoba | HM Exclusivos`;

  const description = `${auto.marca} ${auto.modelo} ${auto.anio} con ${auto.km} en venta en Córdoba. Consultá permutas en HM Exclusivos.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [auto.imagen],
    },
  };
}

export default async function AutoDetalle({ params }: Props) {
  const { slug } = await params;
  const autoDB = await getAutoBySlug(slug);

  if (!autoDB) {
    notFound();
  }

  const auto = {
    id: autoDB.id,
    marca: autoDB.marca,
    modelo: autoDB.modelo,
    anio: autoDB.anio,
    kmNumero: autoDB.km_numero,
    km: autoDB.km,
    condicion: autoDB.condicion,
    precio: autoDB.precio,
    precioNumero: autoDB.precio_numero,
    combustible: autoDB.combustible,
    transmision: autoDB.transmision,
    imagen: autoDB.imagen,
    imagenes: autoDB.imagenes,
    descripcion: autoDB.descripcion,
  };

  const { data: autosDB } = await supabase
    .from("autos")
    .select("*")
    .neq("id", auto.id);

  const autosSimilares = (autosDB || [])
    .map((item) => ({
      id: item.id,
      marca: item.marca,
      modelo: item.modelo,
      anio: item.anio,
      kmNumero: item.km_numero,
      km: item.km,
      condicion: item.condicion,
      precio: item.precio,
      precioNumero: item.precio_numero,
      combustible: item.combustible,
      transmision: item.transmision,
      imagen: item.imagen,
      imagenes: item.imagenes,
      descripcion: item.descripcion,
    }))
    .sort(
      (a, b) =>
        Math.abs(a.precioNumero - auto.precioNumero) -
        Math.abs(b.precioNumero - auto.precioNumero)
    )
    .slice(0, 3);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${auto.marca} ${auto.modelo} ${auto.anio}`,
    brand: {
      "@type": "Brand",
      name: auto.marca,
    },
    model: auto.modelo,
    vehicleModelDate: String(auto.anio),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: auto.kmNumero,
      unitCode: "KMT",
    },
    fuelType: auto.combustible,
    vehicleTransmission: auto.transmision,
    image: auto.imagen,
    description: auto.descripcion,
    offers: {
      "@type": "Offer",
      price: auto.precioNumero,
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock",
      url: `https://hmexclusivos.com.ar/autos/${getAutoSlug(auto)}`,
      seller: {
        "@type": "Organization",
        name: "HM Exclusivos",
      },
    },
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />

      <Navbar />

      <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(40,73,115,0.35),transparent_35%),linear-gradient(180deg,#07111d_0%,#05070a_55%,#05070a_100%)]" />

        <div className="mx-auto max-w-7xl">
          <Link
            href="/#autos"
            className="mb-8 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-[#284973] hover:text-white"
          >
            ← Volver al stock
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40">
              <AutoGallery
                imagenes={auto.imagenes}
                alt={`${auto.marca} ${auto.modelo} ${auto.anio} en Córdoba`}
              />
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#284973]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#9fb8d9]">
                  {auto.condicion}
                </span>

                <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/70">
                  {auto.anio}
                </span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-[#8fb1da] sm:text-5xl">
  {auto.marca}{" "}
  <span className="text-[#8fb1da]">{auto.modelo}</span>
</h1>

<p className="mt-5 text-3xl font-semibold text-white">
  {auto.precio}
</p>

           <p className="mt-6 border-l-2 border-[#284973] pl-4 text-lg leading-relaxed text-white/80">
  {auto.descripcion}
</p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Info label="Kilómetros" value={auto.km} />
                <Info label="Año" value={auto.anio} />
                <Info label="Combustible" value={auto.combustible} />
                <Info label="Transmisión" value={auto.transmision} />
              </div>

              <a
                href={`https://wa.me/5493572532725?text=${encodeURIComponent(
                  `Hola! Estoy viendo el ${auto.marca} ${auto.modelo} ${auto.anio} (${auto.km}) por ${auto.precio}. ¿Sigue disponible?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#1f7a53] px-6 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-[#1f7a53]/25 transition hover:bg-[#279164]"
              >
                Consultar por WhatsApp
              </a>
            </aside>
          </div>

          <section className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9fb8d9]">
                Información
              </p>

              <h2 className="mt-3 text-2xl font-semibold">
                Detalles del vehículo
              </h2>

              <ul className="mt-6 space-y-4 text-white/70">
                <li>• Documentación lista para transferir</li>
                <li>• Estado general verificado</li>
                <li>• Posibilidad de tomar permuta</li>
                <li>• Atención personalizada durante todo el proceso</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9fb8d9]">
                HM Exclusivos
              </p>

              <h2 className="mt-3 text-2xl font-semibold">
                Una compra simple, segura y transparente
              </h2>

              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/65">
                Vehículo seleccionado bajo estándares de calidad, estética y
                confianza. Te acompañamos para que puedas conocer la unidad,
                resolver dudas y avanzar con tranquilidad.
              </p>
            </div>
          </section>

          <section className="mt-24">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#9fb8d9]">
              También puede interesarte
            </p>

            <h2 className="mb-10 text-4xl font-semibold tracking-tight">
              Autos similares por precio
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {autosSimilares.map((item) => (
                <Link
                  key={item.id}
                  href={`/autos/${getAutoSlug(item)}`}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 transition hover:-translate-y-2 hover:border-[#284973]/70"
                >
                  <div className="overflow-hidden">
                    <img
                      src={item.imagen}
                      alt={`${item.marca} ${item.modelo} ${item.anio} en Córdoba`}
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#9fb8d9]">
                      {item.condicion} · {item.anio}
                    </p>

                    <h3 className="text-2xl font-semibold">
                      {item.marca}{" "}
                      <span className="text-white/70">{item.modelo}</span>
                    </h3>

                    <p className="mt-3 text-sm text-white/50">{item.km}</p>

                    <p className="mt-5 text-xl font-semibold text-white">
                      {item.precio}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}