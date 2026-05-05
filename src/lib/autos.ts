import { supabase } from "./supabase";

// 👉 traer todas las marcas únicas
export async function getMarcas() {
  const { data, error } = await supabase
    .from("autos")
    .select("marca");

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