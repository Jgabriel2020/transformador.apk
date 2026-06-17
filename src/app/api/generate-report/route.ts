import { NextRequest, NextResponse } from "next/server";

interface Suggestion {
  category: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  fix: string;
}

interface AnalysisResult {
  score: number;
  summary: string;
  suggestions: Suggestion[];
}

const severityLabel: Record<string, string> = {
  critical: "🔴 Crítico",
  warning: "🟡 Atenção",
  info: "🔵 Melhoria",
};

export async function POST(req: NextRequest) {
  const { result, repoUrl }: { result: AnalysisResult; repoUrl?: string } = await req.json();

  const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const critical = result.suggestions.filter((s) => s.severity === "critical");
  const warning = result.suggestions.filter((s) => s.severity === "warning");
  const info = result.suggestions.filter((s) => s.severity === "info");

  const renderSuggestions = (list: Suggestion[]) =>
    list
      .map(
        (s, i) => `### ${i + 1}. ${s.title}
**Categoria:** ${s.category}
**Severidade:** ${severityLabel[s.severity]}

**Problema:**
${s.description}

**Como corrigir:**
${s.fix}
`
      )
      .join("\n---\n\n");

  const md = `# Relatório de Correções — Google Play Store
> Gerado em ${date}${repoUrl ? `  \n> Repositório: ${repoUrl}` : ""}

---

## Pontuação de conformidade: **${result.score}/100**

${result.summary}

---

## Resumo

| Tipo | Quantidade |
|------|-----------|
| 🔴 Crítico | ${critical.length} |
| 🟡 Atenção | ${warning.length} |
| 🔵 Melhoria | ${info.length} |
| **Total** | **${result.suggestions.length}** |

---
${
  critical.length > 0
    ? `\n## 🔴 Correções Críticas\n\n${renderSuggestions(critical)}`
    : ""
}${
  warning.length > 0
    ? `\n## 🟡 Pontos de Atenção\n\n${renderSuggestions(warning)}`
    : ""
}${
  info.length > 0
    ? `\n## 🔵 Melhorias Sugeridas\n\n${renderSuggestions(info)}`
    : ""
}
---
*Relatório gerado por [Transformador APK](https://transformador-apk.vercel.app) com Gemini 2.5*
`;

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="correcoes-play-store.md"',
    },
  });
}
