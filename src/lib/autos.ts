import { supabase } from "./supabase";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getAutoSlug(auto: {
  marca: string;
  modelo: string;
  anio: string | number;
  id?: string | number;
}) {
  return `${slugify(`${auto.marca} ${auto.modelo} ${auto.anio}`)}-${auto.id}`;
}

// 👉 traer todas las marcas únicas
export async function getMarcas() {
  const { data, error } = await supabase.from("autos").select("marca");

  if (error) throw error;

  const marcasUnicas = [...new Set(data.map((a) => a.marca))];

  return marcasUnicas;
}

// 👉 traer autos por marca
export async function getAutosByMarca(marca: string) {
  const { data, error } = await supabase
    .from("autos")
    .select("*")
    .ilike("marca", marca);

  if (error) throw error;

  return data;
}

// 👉 traer todos los autos
export async function getAutos() {
  const { data, error } = await supabase.from("autos").select("*");

  if (error) throw error;

  return data;
}