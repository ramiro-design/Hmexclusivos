import AutoGallery from "@/components/AutoGallery";
import Navbar from "@/components/Navbar";
import { autos } from "@/data/autos";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AutoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let auto: any = null;

  if (id.startsWith("base-")) {
    const baseId = Number(id.replace("base-", ""));
    auto = autos.find((item) => item.id === baseId);
  }

  if (id.startsWith("db-")) {
    const dbId = Number(id.replace("db-", ""));

    const { data } = await supabase
      .from("autos")
      .select("*")
      .eq("id", dbId)
      .single();

    if (data) {
      auto = {
        id: `db-${data.id}`,
        marca: data.marca,
        modelo: data.modelo,
        anio: data.anio,
        kmNumero: data.km_numero,
        km: data.km,
        condicion: data.condicion,
        precio: data.precio,
        precioNumero: data.precio_numero,
        combustible: data.combustible,
        transmision: data.transmision,
        imagen: data.imagen,
        imagenes: data.imagenes,
        descripcion: data.descripcion,
      };
    }
  }

  if (!auto) {
    notFound();
  }

  const autosBaseFormateados = autos.map((item) => ({
    ...item,
    id: `base-${item.id}`,
  }));

  const autosSimilares = autosBaseFormateados
    .filter((item) => item.id !== auto.id)
    .sort(
      (a, b) =>
        Math.abs(a.precioNumero - auto.precioNumero) -
        Math.abs(b.precioNumero - auto.precioNumero)
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-32 pb-20">
        <Link
          href="/#autos"
          className="text-sm text-neutral-400 hover:text-red-500"
        >
          ← Volver al stock
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <AutoGallery
            imagenes={auto.imagenes}
            alt={`${auto.marca} ${auto.modelo}`}
          />

          <div>
            <div className="mb-4 flex gap-2">
              <span className="rounded-full bg-red-600 px-4 py-1 text-sm font-bold">
                {auto.condicion}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-1 text-sm">
                {auto.anio}
              </span>
            </div>

            <h1 className="text-5xl font-bold">
              {auto.marca} {auto.modelo}
            </h1>

            <p className="mt-4 text-4xl font-bold text-red-500">
              {auto.precio}
            </p>

            <p className="mt-6 text-lg leading-relaxed text-neutral-300">
              {auto.descripcion}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Kilómetros</p>
                <p className="mt-1 text-xl font-semibold">{auto.km}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Año</p>
                <p className="mt-1 text-xl font-semibold">{auto.anio}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Combustible</p>
                <p className="mt-1 text-xl font-semibold">{auto.combustible}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Transmisión</p>
                <p className="mt-1 text-xl font-semibold">
                  {auto.transmision}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-neutral-900 p-6">
              <h2 className="text-xl font-bold">Información del vehículo</h2>

              <ul className="mt-4 space-y-3 text-neutral-300">
                <li>• Documentación lista para transferir</li>
                <li>• Estado general verificado</li>
                <li>• Posibilidad de tomar permuta</li>
                <li>• Consulta por financiación disponible</li>
              </ul>
            </div>

<a
  href={`https://wa.me/5493572532725?text=${encodeURIComponent(
    `Hola! Estoy viendo el ${auto.marca} ${auto.modelo} ${auto.anio} (${auto.km}) por ${auto.precio}. ¿Sigue disponible?`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-8 inline-block w-full rounded-full bg-green-600 px-6 py-4 text-center text-lg font-bold hover:bg-green-700"
>
  Consultar por WhatsApp
</a>
          </div>
        </div>

        <section className="mt-24">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-red-500">
            También puede interesarte
          </p>

          <h2 className="mb-10 text-4xl font-bold">
            Autos similares por precio
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {autosSimilares.map((item) => (
              <Link
                key={item.id}
                href={`/autos/${item.id}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 transition hover:-translate-y-2 hover:border-red-500/50"
              >
                <img
                  src={item.imagen}
                  alt={`${item.marca} ${item.modelo}`}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="p-5">
                  <h3 className="text-2xl font-bold">
                    {item.marca} {item.modelo}
                  </h3>

                  <p className="mt-2 text-sm text-neutral-400">{item.km}</p>
                  <p className="mt-5 text-xl font-bold">{item.precio}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}