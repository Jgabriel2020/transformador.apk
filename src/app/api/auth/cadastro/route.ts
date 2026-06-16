import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password)
    return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });

  if (username.length < 3)
    return NextResponse.json({ error: "Usuário deve ter ao menos 3 caracteres" }, { status: 400 });

  if (password.length < 4)
    return NextResponse.json({ error: "Senha deve ter ao menos 4 caracteres" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("users")
    .insert({ username, password })
    .select("id, username")
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Nome de usuário já existe" }, { status: 409 });
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, username: data.username });
}
