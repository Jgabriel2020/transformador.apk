"use client";
import { supabase } from "./supabase";

export async function saveConversion({
  url,
  appName,
  downloadUrl,
}: {
  url: string;
  appName: string;
  downloadUrl: string;
}) {
  const { error } = await supabase.from("conversions").insert({
    url,
    app_name: appName,
    download_url: downloadUrl,
  });
  if (error) console.error("Supabase save error:", error.message);
}

export async function getConversions() {
  const { data, error } = await supabase
    .from("conversions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("Supabase fetch error:", error.message);
    return [];
  }
  return data;
}
