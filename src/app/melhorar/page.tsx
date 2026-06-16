"use client";
import { useState } from "react";
import {
  Sparkles, Github, Upload, Loader2, CheckCircle, AlertCircle,
  ChevronRight, ShieldCheck, Smartphone, Zap, Eye
} from "lucide-react";
import clsx from "clsx";

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

const severityConfig = {
  critical: { label: "Crítico", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  warning: { label: "Atenção", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  info: { label: "Melhoria", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  "Segurança": <ShieldCheck size={16} />,
  "UI/UX": <Smartphone size={16} />,
  "Performance": <Zap size={16} />,
  "Privacidade": <Eye size={16} />,
};

export default function MelhorarPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"repo" | "apk" | "both">("repo");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function handleAnalyze() {
    if (inputMode === "repo" && !repoUrl) return;
    if (inputMode === "apk" && !apkFile) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      if (repoUrl) formData.append("repoUrl", repoUrl);
      if (apkFile) formData.append("apk", apkFile);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na análise");
      setResult(data);
      setStatus("done");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Erro desconhecido");
      setStatus("error");
    }
  }

  const scoreColor =
    result?.score && result.score >= 80
      ? "text-green-400"
      : result?.score && result.score >= 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 badge bg-accent-600/20 text-purple-400 mb-4">
          <Sparkles size={13} />
          Powered by Gemini 2.5
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Melhorar com IA</h1>
        <p className="text-white/60 text-lg">
          Analise seu projeto e receba sugestões personalizadas para atender aos padrões da Google Play Store.
        </p>
      </div>

      {/* Input card */}
      <div className="glass-card p-6 space-y-5 mb-8">
        {/* Mode selector */}
        <div className="flex gap-2">
          {(["repo", "apk", "both"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setInputMode(m)}
              className={clsx(
                "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all border",
                inputMode === m
                  ? "bg-accent-600 border-accent-500 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              {m === "repo" ? "Repositório GitHub" : m === "apk" ? "Upload APK" : "Ambos"}
            </button>
          ))}
        </div>

        {/* Repo input */}
        {(inputMode === "repo" || inputMode === "both") && (
          <div className="flex items-center gap-3">
            <Github className="text-white/50 shrink-0" size={20} />
            <input
              className="input-field"
              placeholder="https://github.com/usuario/meu-app-android"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
          </div>
        )}

        {/* APK upload */}
        {(inputMode === "apk" || inputMode === "both") && (
          <label className="flex items-center gap-3 cursor-pointer glass-card p-4 hover:bg-white/10 transition-colors">
            <Upload className="text-white/50 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm text-white/80">
                {apkFile ? apkFile.name : "Clique para selecionar o APK"}
              </p>
              <p className="text-xs text-white/40">Arquivo .apk, máx 100MB</p>
            </div>
            <input
              type="file"
              accept=".apk"
              className="hidden"
              onChange={(e) => setApkFile(e.target.files?.[0] || null)}
            />
          </label>
        )}

        <button
          className={clsx("w-full justify-center", status === "loading" ? "btn-secondary" : "btn-primary")}
          style={{ background: status !== "loading" ? "linear-gradient(135deg, #7c3aed, #0284c7)" : undefined }}
          onClick={handleAnalyze}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <><Loader2 size={18} className="animate-spin" /> Analisando com IA...</>
          ) : (
            <><Sparkles size={18} /> Analisar com Gemini</>
          )}
        </button>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}
      </div>

      {/* Results */}
      {status === "done" && result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Score */}
          <div className="glass-card p-6 flex items-center gap-6">
            <div className="text-center shrink-0">
              <p className={clsx("text-6xl font-bold", scoreColor)}>{result.score}</p>
              <p className="text-white/40 text-sm mt-1">/ 100</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-green-400" />
                <h2 className="text-white font-semibold text-lg">Análise concluída</h2>
              </div>
              <p className="text-white/60 text-sm">{result.summary}</p>
              {/* Progress bar */}
              <div className="mt-3 bg-white/10 rounded-full h-2 w-full">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all duration-700"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              {result.suggestions.length} sugestões encontradas
            </h3>
            <div className="space-y-3">
              {result.suggestions.map((s, i) => {
                const cfg = severityConfig[s.severity];
                return (
                  <div key={i} className={clsx("glass-card border", cfg.bg)}>
                    <button
                      className="w-full flex items-center gap-3 p-4 text-left"
                      onClick={() => setExpanded(expanded === i ? null : i)}
                    >
                      <span className="shrink-0 text-white/40">
                        {categoryIcons[s.category] ?? <Sparkles size={16} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={clsx("badge text-xs", cfg.color, cfg.bg)}>{cfg.label}</span>
                          <span className="text-white/40 text-xs">{s.category}</span>
                        </div>
                        <p className="text-white font-medium text-sm">{s.title}</p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={clsx("text-white/40 shrink-0 transition-transform", expanded === i && "rotate-90")}
                      />
                    </button>
                    {expanded === i && (
                      <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                        <p className="text-white/70 text-sm">{s.description}</p>
                        <div className="bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-white/40 mb-1">Como corrigir</p>
                          <p className="text-white/80 text-sm">{s.fix}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
