import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_ANALYZE = "https://n8n.jbrenno.cloud/webhook/analyze-apk";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const repoUrl = formData.get("repoUrl") as string | null;
  const apkFile = formData.get("apk") as File | null;

  if (!repoUrl && !apkFile) {
    return NextResponse.json({ error: "Forneça repositório ou APK" }, { status: 400 });
  }

  let apkInfo = "";
  if (apkFile) {
    const size = (apkFile.size / 1024 / 1024).toFixed(2);
    apkInfo = `${apkFile.name} (${size} MB)`;
  }

  try {
    const n8nRes = await fetch(N8N_WEBHOOK_ANALYZE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl: repoUrl || "", apkInfo }),
    });

    const responseText = await n8nRes.text();

    if (!n8nRes.ok) {
      return NextResponse.json({
        error: `n8n retornou status ${n8nRes.status}: ${responseText}`
      }, { status: 500 });
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({
        error: `Resposta inválida do n8n: ${responseText}`
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
