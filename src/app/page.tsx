"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Download, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import { saveConversion } from "@/lib/supabase-actions";
import { useAuth } from "@/context/AuthContext";

interface ConversionResult {
  jobId: string;
  downloadUrl: string;
  appName: string;
  packageName: string;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  async function handleConvert() {
    if (!url.trim()) return;
    if (!user) { router.push("/login"); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, appName: appName || undefined, packageName: packageName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na conversão");
      setResult(data);
      setStatus("done");
      await saveConversion({ userId: user.id, url, appName: data.appName, downloadUrl: data.downloadUrl });
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Erro desconhecido");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 badge bg-brand-600/20 text-brand-500 mb-4">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          PWA → APK em segundos
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Transforme qualquer site em APK
        </h1>
        <p className="text-white/60 text-lg">
          Cole a URL de um PWA ou web app e gere um APK Android pronto para instalar.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link2 className="text-brand-500 shrink-0" size={20} />
          <input
            className="input-field"
            placeholder="https://meusite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConvert()}
          />
        </div>

        <button
          className="text-white/50 hover:text-white/80 text-sm flex items-center gap-1 transition-colors"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Opções avançadas
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Nome do app</label>
              <input className="input-field text-sm" placeholder="Meu App" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Package name</label>
              <input className="input-field text-sm" placeholder="com.exemplo.meuapp" value={packageName} onChange={(e) => setPackageName(e.target.value)} />
            </div>
          </div>
        )}

        {!user ? (
          <button className="btn-primary w-full justify-center" onClick={() => router.push("/login")}>
            <LogIn size={18} /> Entre para gerar APKs
          </button>
        ) : (
          <button className="btn-primary w-full justify-center" onClick={handleConvert} disabled={!url.trim() || status === "loading"}>
            {status === "loading" ? <><Loader2 size={18} className="animate-spin" /> Gerando APK...</> : <><Download size={18} /> Gerar APK</>}
          </button>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {status === "done" && result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <CheckCircle size={18} /> APK gerado com sucesso!
            </div>
            <div className="text-sm text-white/60 space-y-1">
              <p>App: <span className="text-white">{result.appName}</span></p>
              <p>Package: <span className="text-white font-mono">{result.packageName}</span></p>
            </div>
            <a href={result.downloadUrl} download className="btn-primary w-full justify-center">
              <Download size={16} /> Baixar APK
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          { title: "TWA nativo", desc: "Usa Trusted Web Activity do Google para máxima compatibilidade" },
          { title: "Play Store ready", desc: "APK assinado pronto para envio à Google Play" },
          { title: "Histórico pessoal", desc: "Cada usuário tem seu próprio histórico de conversões" },
        ].map((item) => (
          <div key={item.title} className="glass-card p-4">
            <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
            <p className="text-white/50 text-xs">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
