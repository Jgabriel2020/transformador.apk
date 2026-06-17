import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN || "";
const GH_OWNER = "Jgabriel2020";
const GH_REPO = "transformador.apk";
const GH_WORKFLOW = "build-apk.yml";

export async function POST(req: NextRequest) {
  try {
    const { url, appName, packageName } = await req.json();
    if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });

    let hostname = "app";
    try { hostname = new URL(url).hostname.replace(/\./g, "_").replace(/-/g, "_"); } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const resolvedPackage = packageName || `com.apkbuilder.${hostname}`;
    const resolvedName = appName || new URL(url).hostname.split(".")[0];

    if (!GH_TOKEN) {
      return NextResponse.json({ error: "GITHUB_TOKEN não configurado" }, { status: 500 });
    }

    // Dispara o workflow no GitHub Actions
    const dispatchRes = await fetch(
      `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${GH_WORKFLOW}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            site_url: url,
            app_name: resolvedName,
            package_name: resolvedPackage,
          },
        }),
      }
    );

    if (!dispatchRes.ok) {
      const err = await dispatchRes.text();
      return NextResponse.json({ error: `GitHub Actions erro: ${err}` }, { status: 500 });
    }

    // Aguarda 3s e pega o run_id do workflow disparado
    await new Promise((r) => setTimeout(r, 3000));

    const runsRes = await fetch(
      `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/runs?per_page=1`,
      { headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" } }
    );
    const runsData = await runsRes.json();
    const runId = runsData.workflow_runs?.[0]?.id;

    return NextResponse.json({
      building: true,
      runId,
      appName: resolvedName,
      packageName: resolvedPackage,
      message: "APK sendo gerado (3-5 minutos)...",
    });

  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
