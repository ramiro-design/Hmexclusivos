import { getAutosByMarca, getMarcas } from "@/lib/autos";

type PageProps = {
  params: Promise<{
    marca: string;
  }>;
};

function formatMarca(marca: string) {
  return decodeURIComponent(marca)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({ params }: PageProps) {
  const { marca } = await params;
  const marcaFormateada = formatMarca(marca);

  return {
    title: `${marcaFormateada} usados en Córdoba | HM Exclusivos`,
    description: `Compra ${marcaFormateada} usados en Córdoba. Vehículos seleccionados con financiación y asesoramiento personalizado.`,
  };
}

export async function generateStaticParams() {
  const marcas = await getMarcas();

  return marcas.map((marca: string) => ({
    marca: marca.toLowerCase().replaceAll(" ", "-"),
  }));
}

export default async function Page({ params }: PageProps) {
  const { marca } = await params;

  const marcaFormateada = formatMarca(marca);
  const autos = await getAutosByMarca(marcaFormateada);

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">
          Autos {marcaFormateada} en Córdoba
        </h1>

        <p className="mt-4 max-w-2xl text-neutral-400">
          Vehículos {marcaFormateada} seleccionados por HM Exclusivos. Consultá
          disponibilidad, financiación y opciones de permuta.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {autos.map((auto: any) => (
            <article
              key={auto.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              {/* IMAGEN */}
              {auto.imagen && (
                <img
                  src={auto.imagen}
                  alt={`${auto.marca} ${auto.modelo}`}
                  className="h-56 w-full object-cover"
                />
              )}

              <div className="p-5">
                <h2 className="text-xl font-semibold">
                  {auto.marca} {auto.modelo}
                </h2>

                <p className="mt-2 text-neutral-400">
                  {auto.anio} {auto.km ? `• ${auto.km}` : ""}
                </p>

                {/* LINK CORRECTO */}
                <a
                  href={`/autos/db-${auto.id}`}
                  className="mt-5 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
                >
                  Ver detalle
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}