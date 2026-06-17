"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Link2, Download, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import { saveConversion } from "@/lib/supabase-actions";
import { useAuth } from "@/context/AuthContext";

type Status = "idle" | "loading" | "building" | "done" | "error";

interface BuildResult {
  runId: number;
  appName: string;
  packageName: string;
  downloadUrl?: string;
}

const BUILD_STEPS = [
  "Iniciando build no GitHub Actions...",
  "Configurando Android SDK...",
  "Compilando código Kotlin...",
  "Gerando APK...",
  "Assinando APK...",
  "Finalizando...",
];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<BuildResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [buildStep, setBuildStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Incrementa step de loading visualmente
  useEffect(() => {
    if (status !== "building") return;
    const interval = setInterval(() => {
      setBuildStep((s) => Math.min(s + 1, BUILD_STEPS.length - 1));
      setElapsed((e) => e + 5);
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  // Polling do status do build
  useEffect(() => {
    if (status !== "building" || !result?.runId) return;

    async function poll() {
      const res = await fetch(`/api/build-status?runId=${result!.runId}`);
      const data = await res.json();

      if (data.status === "completed" && data.conclusion === "success" && data.downloadUrl) {
        clearInterval(pollRef.current!);
        setResult((r) => ({ ...r!, downloadUrl: data.downloadUrl }));
        setStatus("done");
        if (user) {
          await saveConversion({
            userId: user.id,
            url,
            appName: result!.appName,
            downloadUrl: data.downloadUrl,
          });
        }
      } else if (data.status === "completed" && data.conclusion !== "success") {
        clearInterval(pollRef.current!);
        setErrorMsg("Build falhou no GitHub Actions. Tente novamente.");
        setStatus("error");
      }
    }

    pollRef.current = setInterval(poll, 10000);
    return () => clearInterval(pollRef.current!);
  }, [status, result?.runId]);

  async function handleConvert() {
    if (!url.trim()) return;
    if (!user) { router.push("/login"); return; }

    setStatus("loading");
    setErrorMsg("");
    setBuildStep(0);
    setElapsed(0);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, appName: appName || undefined, packageName: packageName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult({ runId: data.runId, appName: data.appName, packageName: data.packageName });
      setStatus("building");
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
          Qualquer site → APK real
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Transforme qualquer site em APK</h1>
        <p className="text-white/60 text-lg">
          Cole a URL de qualquer site e gere um APK Android com WebView nativo.
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
            disabled={status === "building"}
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
              <input className="input-field text-sm" placeholder="com.exemplo.app" value={packageName} onChange={(e) => setPackageName(e.target.value)} />
            </div>
          </div>
        )}

        {!user ? (
          <button className="btn-primary w-full justify-center" onClick={() => router.push("/login")}>
            <LogIn size={18} /> Entre para gerar APKs
          </button>
        ) : (
          <button
            className="btn-primary w-full justify-center"
            onClick={handleConvert}
            disabled={!url.trim() || status === "loading" || status === "building"}
          >
            {status === "loading" ? (
              <><Loader2 size={18} className="animate-spin" /> Iniciando...</>
            ) : status === "building" ? (
              <><Loader2 size={18} className="animate-spin" /> Gerando APK...</>
            ) : (
              <><Download size={18} /> Gerar APK</>
            )}
          </button>
        )}

        {/* Building progress */}
        {status === "building" && (
          <div className="bg-brand-600/10 border border-brand-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-400 font-medium flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                {BUILD_STEPS[buildStep]}
              </span>
              <span className="text-white/40">{elapsed}s</span>
            </div>
            <div className="bg-white/10 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-brand-500 transition-all duration-1000"
                style={{ width: `${Math.min(((buildStep + 1) / BUILD_STEPS.length) * 90, 90)}%` }}
              />
            </div>
            <p className="text-white/30 text-xs">Build no GitHub Actions — aprox. 3-5 minutos</p>
          </div>
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
            <a
              href={`/api/download?runId=${result.runId}`}
              className="btn-primary w-full justify-center"
            >
              <Download size={16} /> Baixar APK
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          { title: "WebView nativo", desc: "APK real compilado com Kotlin e Android SDK" },
          { title: "Qualquer URL", desc: "Funciona com qualquer site, não precisa de manifest" },
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
