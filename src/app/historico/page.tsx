"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, History, ExternalLink, Loader2, LogIn } from "lucide-react";
import { getConversions } from "@/lib/supabase-actions";
import { useAuth } from "@/context/AuthContext";

interface Conversion {
  id: string;
  url: string;
  app_name: string;
  download_url: string;
  created_at: string;
}

export default function HistoricoPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    getConversions(user.id).then((data) => {
      setConversions(data || []);
      setLoading(false);
    });
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass-card p-16 text-center">
          <History size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-2">Faça login para ver seu histórico</p>
          <p className="text-white/40 text-sm mb-6">Cada usuário tem seu próprio histórico de conversões.</p>
          <button className="btn-primary mx-auto" onClick={() => router.push("/login")}>
            <LogIn size={16} /> Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-10">
        <History size={24} className="text-brand-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Histórico</h1>
          <p className="text-white/40 text-sm">Conversões de {user.username}</p>
        </div>
      </div>

      {conversions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <History size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhuma conversão ainda.</p>
          <p className="text-white/30 text-sm mt-1">Converta um site para APK e ele aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversions.map((c) => (
            <div key={c.id} className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center shrink-0">
                <Download size={18} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{c.app_name || c.url}</p>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 text-xs hover:text-brand-400 flex items-center gap-1 transition-colors w-fit"
                >
                  {c.url} <ExternalLink size={10} />
                </a>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white/40 text-xs">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
                <a href={c.download_url} download className="btn-secondary text-xs py-1.5 px-3 mt-1 inline-flex">
                  <Download size={12} /> Baixar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
