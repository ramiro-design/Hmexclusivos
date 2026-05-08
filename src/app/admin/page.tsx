"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_IMAGENES = 10;

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [autos, setAutos] = useState<any[]>([]);
  const [userChecked, setUserChecked] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [editandoId, setEditandoId] = useState<string | number | null>(null);

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    anio: "",
    km: "",
    condicion: "Usado",
    precio: "",
    moneda: "USD",
    combustible: "Nafta",
    transmision: "Automática",
    descripcion: "",
  });

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imagenPrincipalIndex, setImagenPrincipalIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    const urlsNuevas = imagenes.map((imagen) => URL.createObjectURL(imagen));

    setPreviewUrls([...imagenesExistentes, ...urlsNuevas]);

    return () => {
      urlsNuevas.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagenes, imagenesExistentes]);

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

  const resetForm = () => {
    setForm({
      marca: "",
      modelo: "",
      anio: "",
      km: "",
      condicion: "Usado",
      precio: "",
      moneda: "USD",
      combustible: "Nafta",
      transmision: "Automática",
      descripcion: "",
    });

    setImagenes([]);
    setImagenesExistentes([]);
    setPreviewUrls([]);
    setImagenPrincipalIndex(0);
    setDragIndex(null);
    setEditandoId(null);
  };

  const seleccionarImagenes = (files: FileList | null) => {
    const nuevasImagenes = Array.from(files || []);

    const totalActual = imagenesExistentes.length + imagenes.length;
    const disponibles = MAX_IMAGENES - totalActual;

    if (disponibles <= 0) {
      setMensaje(`Ya tenés el máximo de ${MAX_IMAGENES} imágenes.`);
      return;
    }

    setImagenes((prev) => [
      ...prev,
      ...nuevasImagenes.slice(0, disponibles),
    ]);
  };

  const quitarImagen = (index: number) => {
    const cantidadExistentes = imagenesExistentes.length;

    if (index < cantidadExistentes) {
      setImagenesExistentes((prev) =>
        prev.filter((_, i) => i !== index)
      );
    } else {
      const indexNueva = index - cantidadExistentes;

      setImagenes((prev) =>
        prev.filter((_, i) => i !== indexNueva)
      );
    }

    setImagenPrincipalIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const moverImagen = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const todas = [
      ...imagenesExistentes.map((url) => ({
        tipo: "existente" as const,
        valor: url,
      })),
      ...imagenes.map((file) => ({
        tipo: "nueva" as const,
        valor: file,
      })),
    ];

    const [movida] = todas.splice(fromIndex, 1);

    todas.splice(toIndex, 0, movida);

    setImagenesExistentes(
      todas
        .filter((item) => item.tipo === "existente")
        .map((item) => item.valor as string)
    );

    setImagenes(
      todas
        .filter((item) => item.tipo === "nueva")
        .map((item) => item.valor as File)
    );

    setImagenPrincipalIndex((prev) => {
      if (prev === fromIndex) return toIndex;
      if (fromIndex < prev && toIndex >= prev) return prev - 1;
      if (fromIndex > prev && toIndex <= prev) return prev + 1;
      return prev;
    });
  };

  const editarAuto = (auto: any) => {
    const imagenesAuto =
      Array.isArray(auto.imagenes) && auto.imagenes.length > 0
        ? auto.imagenes
        : auto.imagen
        ? [auto.imagen]
        : [];

    const principalIndex = imagenesAuto.findIndex(
      (imagen: string) => imagen === auto.imagen
    );

    setEditandoId(auto.id);

    setForm({
      marca: auto.marca || "",
      modelo: auto.modelo || "",
      anio: String(auto.anio || ""),
      km: String(auto.km_numero || ""),
      condicion: auto.condicion || "Usado",
      precio: String(auto.precio_numero || ""),
      moneda: auto.moneda || "USD",
      combustible: auto.combustible || "Nafta",
      transmision: auto.transmision || "Automática",
      descripcion: auto.descripcion || "",
    });

    setImagenes([]);
    setImagenesExistentes(imagenesAuto);
    setImagenPrincipalIndex(principalIndex >= 0 ? principalIndex : 0);

    setMensaje("Editando vehículo.");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
        setMensaje(
          "Completá marca, modelo, año, kilómetros y precio."
        );
        return;
      }

      if (
        imagenes.length === 0 &&
        imagenesExistentes.length === 0
      ) {
        setMensaje("Subí al menos una foto.");
        return;
      }

      setLoading(true);

      const urlsImagenesNuevas: string[] = [];

      for (const imagen of imagenes) {
        const filePath = `${crypto.randomUUID()}-${imagen.name}`;

        const { error: uploadError } = await supabase.storage
          .from("autos")
          .upload(filePath, imagen);

        if (uploadError) throw uploadError;

        const { data } =
          supabase.storage.from("autos").getPublicUrl(filePath);

        urlsImagenesNuevas.push(data.publicUrl);
      }

      const todasLasImagenes = [
        ...imagenesExistentes,
        ...urlsImagenesNuevas,
      ];

      const imagenPrincipal =
        todasLasImagenes[imagenPrincipalIndex] ||
        todasLasImagenes[0] ||
        "";

      const precioFormateado =
        form.moneda === "USD"
          ? `US$ ${Number(form.precio).toLocaleString("es-AR")}`
          : `$ ${Number(form.precio).toLocaleString("es-AR")}`;

      const payload = {
        marca: form.marca,
        modelo: form.modelo,
        anio: Number(form.anio),
        km_numero: Number(form.km),
        km: `${Number(form.km).toLocaleString("es-AR")} km`,
        condicion: form.condicion,
        precio: precioFormateado,
        precio_numero: Number(form.precio),
        moneda: form.moneda,
        combustible: form.combustible,
        transmision: form.transmision,
        descripcion: form.descripcion,
        imagen: imagenPrincipal,
        imagenes: todasLasImagenes,
      };

      let resultado;

      if (editandoId) {
        resultado = await supabase
          .from("autos")
          .update(payload)
          .eq("id", editandoId)
          .select();
      } else {
        resultado = await supabase
          .from("autos")
          .insert(payload)
          .select();
      }

      if (resultado.error) throw resultado.error;

      setMensaje(
        editandoId
          ? "Vehículo actualizado correctamente."
          : "Vehículo guardado correctamente."
      );

      resetForm();
      await cargarAutos();
    } catch (error: any) {
      setMensaje(
        error?.message ||
          "Hubo un error al guardar el vehículo."
      );
    } finally {
      setLoading(false);
    }
  };

  const eliminarAuto = async (id: string | number) => {
    const confirmar = confirm("¿Eliminar este auto?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("autos")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje("Error al eliminar el auto.");
      return;
    }

    setMensaje("Auto eliminado correctamente.");

    if (editandoId === id) {
      resetForm();
    }

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

            <h1 className="text-4xl font-bold">
              Panel Admin
            </h1>

            <p className="mt-2 text-neutral-400">
              Cargá, editá y administrá vehículos.
            </p>
          </div>

          <button
            type="button"
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
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">
              {editandoId
                ? "Editar vehículo"
                : "Nuevo vehículo"}
            </h2>

            {editandoId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white hover:text-black"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["marca", "Marca"],
              ["modelo", "Modelo"],
              ["anio", "Año"],
              ["km", "Kilómetros"],
              ["precio", "Precio"],
            ].map(([key, label]) => (
              <input
                key={key}
                placeholder={label}
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
                className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
              />
            ))}

            <select
              value={form.moneda}
              onChange={(e) =>
                setForm({
                  ...form,
                  moneda: e.target.value,
                })
              }
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            >
              <option value="USD">
                US$ Dólares
              </option>

              <option value="ARS">
                $ Pesos Argentinos
              </option>
            </select>

            <select
              value={form.condicion}
              onChange={(e) =>
                setForm({
                  ...form,
                  condicion: e.target.value,
                })
              }
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            >
              <option>Usado</option>
              <option>Nuevo</option>
            </select>

            <select
              value={form.combustible}
              onChange={(e) =>
                setForm({
                  ...form,
                  combustible: e.target.value,
                })
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
                setForm({
                  ...form,
                  transmision: e.target.value,
                })
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
              setForm({
                ...form,
                descripcion: e.target.value,
              })
            }
            className="min-h-32 rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
          />

          <div className="rounded-2xl border border-dashed border-white/20 bg-black p-5">
            <p className="mb-3 font-semibold">
              Fotos del vehículo
            </p>

            <p className="mb-4 text-sm text-neutral-400">
              Podés subir hasta {MAX_IMAGENES} imágenes.
              Arrastralas para cambiar el orden.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                seleccionarImagenes(e.target.files)
              }
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3"
            />

            {previewUrls.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    draggable
                    onDragStart={() =>
                      setDragIndex(index)
                    }
                    onDragOver={(e) =>
                      e.preventDefault()
                    }
                    onDrop={() => {
                      if (dragIndex !== null) {
                        moverImagen(
                          dragIndex,
                          index
                        );

                        setDragIndex(null);
                      }
                    }}
                    onDragEnd={() =>
                      setDragIndex(null)
                    }
                    className={`relative cursor-grab overflow-hidden rounded-2xl border bg-neutral-900 active:cursor-grabbing ${
                      imagenPrincipalIndex === index
                        ? "border-red-500"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-36 w-full object-cover"
                    />

                    <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                      {imagenPrincipalIndex ===
                      index ? (
                        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                          Principal
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setImagenPrincipalIndex(
                              index
                            )
                          }
                          className="rounded-full bg-black/80 px-3 py-1 text-xs font-bold hover:bg-red-600"
                        >
                          Hacer principal
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          quitarImagen(index)
                        }
                        className="rounded-full bg-black/80 px-3 py-1 text-xs font-bold hover:bg-red-600"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="absolute bottom-3 right-3 rounded-full bg-black/80 px-3 py-1 text-xs font-bold">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={guardarAuto}
            disabled={loading}
            className="rounded-full bg-red-600 px-6 py-4 font-bold transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading
              ? editandoId
                ? "Actualizando vehículo..."
                : "Guardando vehículo..."
              : editandoId
              ? "Actualizar vehículo"
              : "Guardar vehículo"}
          </button>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">
            Autos cargados
          </h2>

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
                      {auto.anio} · {auto.km} ·{" "}
                      {auto.precio}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      editarAuto(auto)
                    }
                    className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white hover:text-black"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarAuto(auto.id)
                    }
                    className="rounded-full bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}