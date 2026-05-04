"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [autos, setAutos] = useState<any[]>([]);
  const [userChecked, setUserChecked] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    anio: "",
    km: "",
    condicion: "Usado",
    precio: "",
    combustible: "Nafta",
    transmision: "Automática",
    descripcion: "",
  });

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = imagenes.map((imagen) => URL.createObjectURL(imagen));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagenes]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUserChecked(true);
      cargarAutos();
    };

    checkUser();
  }, [router]);

  const cargarAutos = async () => {
    const { data, error } = await supabase
      .from("autos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensaje("Error al cargar autos");
      return;
    }

    setAutos(data || []);
  };

  const quitarImagen = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  };

  const guardarAuto = async () => {
    try {
      setMensaje("");

      if (
        !form.marca ||
        !form.modelo ||
        !form.anio ||
        !form.km ||
        !form.precio
      ) {
        setMensaje("Completá marca, modelo, año, kilómetros y precio.");
        return;
      }

      if (imagenes.length === 0) {
        setMensaje("Subí al menos una foto.");
        return;
      }

      setLoading(true);

      const urlsImagenes: string[] = [];

      for (const imagen of imagenes.slice(0, 6)) {
        const filePath = `${crypto.randomUUID()}-${imagen.name}`;

        const { error: uploadError } = await supabase.storage
          .from("autos")
          .upload(filePath, imagen);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("autos").getPublicUrl(filePath);
        urlsImagenes.push(data.publicUrl);
      }

      const { error } = await supabase.from("autos").insert({
        marca: form.marca,
        modelo: form.modelo,
        anio: Number(form.anio),
        km_numero: Number(form.km),
        km: `${Number(form.km).toLocaleString("es-AR")} km`,
        condicion: form.condicion,
        precio: `USD ${form.precio}`,
        precio_numero: Number(form.precio),
        combustible: form.combustible,
        transmision: form.transmision,
        descripcion: form.descripcion,
        imagen: urlsImagenes[0],
        imagenes: urlsImagenes,
      });

      if (error) throw error;

      setMensaje("Vehículo guardado correctamente.");

      setForm({
        marca: "",
        modelo: "",
        anio: "",
        km: "",
        condicion: "Usado",
        precio: "",
        combustible: "Nafta",
        transmision: "Automática",
        descripcion: "",
      });

      setImagenes([]);
      cargarAutos();
    } catch (error) {
      console.log(error);
      setMensaje("Hubo un error al guardar el vehículo.");
    } finally {
      setLoading(false);
    }
  };

  const eliminarAuto = async (id: number) => {
    const confirmar = confirm("¿Eliminar este auto?");
    if (!confirmar) return;

    const { error } = await supabase.from("autos").delete().eq("id", id);

    if (error) {
      setMensaje("Error al eliminar el auto.");
      return;
    }

    setMensaje("Auto eliminado correctamente.");
    cargarAutos();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!userChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p>Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-red-500">
              Administración
            </p>
            <h1 className="text-4xl font-bold">Panel Admin</h1>
            <p className="mt-2 text-neutral-400">
              Cargá, revisá y administrá vehículos.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white hover:text-black"
          >
            Cerrar sesión
          </button>
        </div>

        {mensaje && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900 px-5 py-4 text-sm text-neutral-200">
            {mensaje}
          </div>
        )}

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-neutral-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["marca", "Marca"],
              ["modelo", "Modelo"],
              ["anio", "Año"],
              ["km", "Kilómetros"],
              ["precio", "Precio en USD"],
            ].map(([key, label]) => (
              <input
                key={key}
                placeholder={label}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
              />
            ))}

            <select
              value={form.condicion}
              onChange={(e) => setForm({ ...form, condicion: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            >
              <option>Usado</option>
              <option>Nuevo</option>
            </select>

            <select
              value={form.combustible}
              onChange={(e) =>
                setForm({ ...form, combustible: e.target.value })
              }
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            >
              <option>Nafta</option>
              <option>Diesel</option>
              <option>Híbrido</option>
              <option>Eléctrico</option>
            </select>

            <select
              value={form.transmision}
              onChange={(e) =>
                setForm({ ...form, transmision: e.target.value })
              }
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            >
              <option>Automática</option>
              <option>Manual</option>
            </select>
          </div>

          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) =>
              setForm({ ...form, descripcion: e.target.value })
            }
            className="min-h-32 rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
          />

          <div className="rounded-2xl border border-dashed border-white/20 bg-black p-5">
            <p className="mb-3 font-semibold">Fotos del vehículo</p>
            <p className="mb-4 text-sm text-neutral-400">
              Podés subir hasta 6 imágenes. La primera será la principal.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setImagenes(Array.from(e.target.files || []).slice(0, 6))
              }
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3"
            />

            {previewUrls.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={url}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-36 w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                        Principal
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => quitarImagen(index)}
                      className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold hover:bg-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={guardarAuto}
            disabled={loading}
            className="rounded-full bg-red-600 px-6 py-4 font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Guardando vehículo..." : "Guardar vehículo"}
          </button>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Autos cargados</h2>

          <div className="grid gap-4">
            {autos.map((auto) => (
              <div
                key={auto.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900 p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={auto.imagen}
                    alt={`${auto.marca} ${auto.modelo}`}
                    className="h-20 w-28 rounded-xl object-cover"
                  />

                  <div>
                    <p className="font-bold">
                      {auto.marca} {auto.modelo}
                    </p>

                    <p className="text-sm text-neutral-400">
                      {auto.anio} · {auto.km} · {auto.precio}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => eliminarAuto(auto.id)}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}