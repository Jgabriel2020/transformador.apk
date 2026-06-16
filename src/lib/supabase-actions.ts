"use client";
import { supabase } from "./supabase";

export async function saveConversion({
  userId,
  url,
  appName,
  downloadUrl,
}: {
  userId: string;
  url: string;
  appName: string;
  downloadUrl: string;
}) {
  const { error } = await supabase.from("conversions").insert({
    user_id: userId,
    url,
    app_name: appName,
    download_url: downloadUrl,
  });
  if (error) console.error("Supabase save error:", error.message);
}

export async function getConversions(userId: string) {
  const { data, error } = await supabase
    .from("conversions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("Supabase fetch error:", error.message);
    return [];
  }
  return data;
}
