import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN || "";
const GH_OWNER = "Jgabriel2020";
const GH_REPO = "transformador.apk";

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) return NextResponse.json({ error: "runId obrigatório" }, { status: 400 });

  const headers = { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" };

  // Status do run
  const runRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/runs/${runId}`,
    { headers }
  );
  const run = await runRes.json();

  if (run.status !== "completed") {
    return NextResponse.json({ status: run.status, conclusion: null, downloadUrl: null });
  }

  if (run.conclusion !== "success") {
    return NextResponse.json({ status: "completed", conclusion: run.conclusion, downloadUrl: null });
  }

  // Busca o artifact gerado
  const artifactsRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/runs/${runId}/artifacts`,
    { headers }
  );
  const artifactsData = await artifactsRes.json();
  const artifact = artifactsData.artifacts?.[0];

  if (!artifact) {
    return NextResponse.json({ status: "completed", conclusion: "success", downloadUrl: null });
  }

  // URL de download (requer auth — retornamos a URL da API que faz redirect)
  const downloadUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/artifacts/${artifact.id}/zip`;

  return NextResponse.json({
    status: "completed",
    conclusion: "success",
    downloadUrl,
    artifactId: artifact.id,
  });
}
