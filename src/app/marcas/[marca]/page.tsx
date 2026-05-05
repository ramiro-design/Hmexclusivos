import { getAutosByMarca, getMarcas } from "@/lib/autos";

type Props = {
  params: {
    marca: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const marca = params?.marca
    ? decodeURIComponent(params.marca)
    : "Autos premium";

  return {
    title: `${marca} usados en Córdoba | HM Exclusivos`,
    description: `Compra ${marca} usados en Córdoba. Vehículos seleccionados con financiación y asesoramiento personalizado.`,
  };
}

export async function generateStaticParams() {
  const marcas = await getMarcas();

  return marcas.map((marca: string) => ({
    marca: marca.toLowerCase(),
  }));
}

export default async function Page({ params }: Props) {
  const marcaParam = params?.marca;

  if (!marcaParam) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <h1 className="text-3xl font-bold">Marca no encontrada</h1>
      </main>
    );
  }

  const marca = decodeURIComponent(marcaParam);
  const autos = await getAutosByMarca(marca);

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Autos {marca} en Córdoba</h1>

        <p className="mt-4 max-w-2xl text-neutral-400">
          Vehículos {marca} seleccionados por HM Exclusivos. Consultá
          disponibilidad, financiación y opciones de permuta.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {autos.map((auto: any) => (
            <article
              key={auto.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              {/* Imagen */}
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

                {/* Link correcto */}
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