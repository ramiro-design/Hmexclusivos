"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [autos, setAutos] = useState<any[]>([]);
  const [userChecked, setUserChecked] = useState(false);

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

  // 🔐 CHEQUEO DE LOGIN
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
  }, []);

  const cargarAutos = async () => {
    const { data, error } = await supabase
      .from("autos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(JSON.stringify(error, null, 2));
      return;
    }

    setAutos(data || []);
  };

  const guardarAuto = async () => {
    try {
      setLoading(true);

      if (imagenes.length === 0) {
        alert("Subí al menos una foto");
        return;
      }

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

      alert("Auto guardado correctamente");

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
      alert(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const eliminarAuto = async (id: number) => {
    const confirmar = confirm("¿Eliminar este auto?");
    if (!confirmar) return;

    const { error } = await supabase.from("autos").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar el auto");
      return;
    }

    cargarAutos();
  };

  // 🔐 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 🔒 mientras chequea usuario
  if (!userChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p>Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Panel Admin</h1>

          <button
            onClick={logout}
            className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white hover:text-black"
          >
            Cerrar sesión
          </button>
        </div>

        <p className="mt-2 text-neutral-400">
          Cargar y administrar vehículos
        </p>

        {/* FORM */}
        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-neutral-900 p-6">
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
  onChange={(e) => setForm({ ...form, combustible: e.target.value })}
  className="rounded-xl border border-white/10 bg-black px-4 py-3"
>
  <option>Nafta</option>
  <option>Diesel</option>
  <option>Híbrido</option>
  <option>Eléctrico</option>
</select>

<select
  value={form.transmision}
  onChange={(e) => setForm({ ...form, transmision: e.target.value })}
  className="rounded-xl border border-white/10 bg-black px-4 py-3"
>
  <option>Automática</option>
  <option>Manual</option>
</select>
          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="min-h-32 rounded-xl border border-white/10 bg-black px-4 py-3"
          />

          <input
            type="file"
            multiple
            onChange={(e) =>
              setImagenes(Array.from(e.target.files || []).slice(0, 6))
            }
            className="rounded-xl border border-white/10 bg-black px-4 py-3"
          />

          <button
            onClick={guardarAuto}
            disabled={loading}
            className="rounded-full bg-red-600 px-6 py-4 font-bold hover:bg-red-700"
          >
            {loading ? "Guardando..." : "Guardar vehículo"}
          </button>
        </div>

        {/* LISTA */}
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
                    className="h-20 w-28 rounded-xl object-cover"
                  />

                  <div>
                    <p className="font-bold">
                      {auto.marca} {auto.modelo}
                    </p>

                    <p className="text-sm text-neutral-400">
                      {auto.anio} · {auto.precio}
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