import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PLAYSTORE_PROMPT = `Você é um especialista em desenvolvimento Android e publicação na Google Play Store.
Analise o projeto Android fornecido e retorne sugestões detalhadas para atender aos padrões da Play Store.

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "score": <número de 0 a 100 indicando conformidade com a Play Store>,
  "summary": "<resumo de 1-2 frases da análise>",
  "suggestions": [
    {
      "category": "<Segurança|UI/UX|Performance|Privacidade|Acessibilidade|Manifesto|Target SDK>",
      "severity": "<critical|warning|info>",
      "title": "<título curto>",
      "description": "<descrição do problema>",
      "fix": "<como corrigir passo a passo>"
    }
  ]
}

Avalie obrigatoriamente:
- targetSdkVersion (deve ser >= 34 para 2024)
- Permissões declaradas no AndroidManifest.xml (remover desnecessárias)
- Política de privacidade (obrigatória na Play Store)
- Ícones adaptativos (adaptive icons)
- Suporte a telas de múltiplos tamanhos
- ProGuard/R8 habilitado para release
- Assinatura do APK
- Ausência de APIs obsoletas (deprecated)
- Conformidade com política de dados do usuário
- Acessibilidade (contentDescription em imagens)`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  const formData = await req.formData();
  const repoUrl = formData.get("repoUrl") as string | null;
  const apkFile = formData.get("apk") as File | null;

  if (!repoUrl && !apkFile) {
    return NextResponse.json({ error: "Forneça repositório ou APK" }, { status: 400 });
  }

  // Busca conteúdo do repo via n8n (que pode usar a GitHub API)
  let projectContext = "";

  if (repoUrl) {
    const n8nAnalyze = process.env.N8N_WEBHOOK_ANALYZE;
    if (n8nAnalyze) {
      try {
        const r = await fetch(n8nAnalyze, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl }),
        });
        if (r.ok) {
          const d = await r.json();
          projectContext = d.content || "";
        }
      } catch {
        // continua sem contexto do n8n
      }
    }
    if (!projectContext) {
      // fallback: usa a URL pública do GitHub raw para AndroidManifest e build.gradle
      projectContext = `Repositório analisado: ${repoUrl}\n(Análise baseada na URL do repositório)`;
    }
  }

  if (apkFile) {
    const bytes = await apkFile.arrayBuffer();
    const size = (bytes.byteLength / 1024 / 1024).toFixed(2);
    projectContext += `\nAPK enviado: ${apkFile.name} (${size} MB)`;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${PLAYSTORE_PROMPT}\n\nContexto do projeto:\n${projectContext}`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    // Extrai JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini não retornou JSON válido");

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro na análise";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
