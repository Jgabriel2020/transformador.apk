import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN || "";
const GH_OWNER = "Jgabriel2020";
const GH_REPO = "transformador.apk";

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) return NextResponse.json({ error: "runId obrigatório" }, { status: 400 });

  const headers = { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" };

  const artifactsRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/runs/${runId}/artifacts`,
    { headers }
  );
  const data = await artifactsRes.json();
  const artifact = data.artifacts?.[0];
  if (!artifact) return NextResponse.json({ error: "Artifact não encontrado" }, { status: 404 });

  // Faz o download autenticado e repassa o zip ao cliente
  const zipRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/artifacts/${artifact.id}/zip`,
    { headers: { ...headers, Accept: "application/vnd.github+json" } }
  );

  const buffer = await zipRes.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="app.zip"`,
    },
  });
}
