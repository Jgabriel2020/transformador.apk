import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_CONVERT = "https://n8n.jbrenno.cloud/webhook/convert-apk";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, appName, packageName } = body;

    if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });

    let hostname = "app";
    try {
      hostname = new URL(url).hostname.replace(/\./g, "_").replace(/-/g, "_");
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const resolvedPackage = packageName || `com.apkbuilder.${hostname}`;
    const resolvedName = appName || hostname.split("_")[0];

    const n8nRes = await fetch(N8N_WEBHOOK_CONVERT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, appName: resolvedName, packageName: resolvedPackage }),
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
        error: `n8n não retornou JSON: ${responseText.substring(0, 300)}`
      }, { status: 500 });
    }

    return NextResponse.json({
      jobId: (data.jobId as string) || crypto.randomUUID(),
      downloadUrl: data.downloadUrl,
      appName: resolvedName,
      packageName: resolvedPackage,
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Erro interno: ${msg}` }, { status: 500 });
  }
}
