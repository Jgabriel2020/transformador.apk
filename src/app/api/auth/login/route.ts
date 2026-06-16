import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password)
    return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("users")
    .select("id, username")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data)
    return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });

  return NextResponse.json({ id: data.id, username: data.username });
}
