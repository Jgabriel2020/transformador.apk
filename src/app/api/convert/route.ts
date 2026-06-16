import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url, appName, packageName } = await req.json();

  if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });

  const webhookUrl = process.env.N8N_WEBHOOK_CONVERT;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook n8n não configurado" }, { status: 500 });
  }

  // Deriva package name e app name se não fornecidos
  const hostname = new URL(url).hostname.replace(/\./g, "_").replace(/-/g, "_");
  const resolvedPackage = packageName || `com.apkbuilder.${hostname}`;
  const resolvedName = appName || new URL(url).hostname.split(".")[0];

  try {
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, appName: resolvedName, packageName: resolvedPackage }),
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text();
      throw new Error(`n8n retornou erro: ${text}`);
    }

    const data = await n8nRes.json();

    return NextResponse.json({
      jobId: data.jobId || crypto.randomUUID(),
      downloadUrl: data.downloadUrl,
      appName: resolvedName,
      packageName: resolvedPackage,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
