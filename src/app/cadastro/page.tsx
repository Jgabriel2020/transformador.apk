"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, User, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CadastroPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas não coincidem"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      login({ id: data.id, username: data.username });
      setTimeout(() => router.push("/"), 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <Package size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Criar conta</h1>
          <p className="text-white/50 mt-1">Comece a gerar APKs gratuitamente</p>
        </div>

        <form onSubmit={handleCadastro} className="glass-card p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-white/70 text-sm font-medium">Usuário</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                className="input-field pl-10"
                placeholder="seu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                minLength={3}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/70 text-sm font-medium">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={4}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/70 text-sm font-medium">Confirmar senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 rounded-xl px-4 py-3 text-sm">
              <CheckCircle size={15} /> Conta criada! Redirecionando...
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading || success}>
            {loading ? <><Loader2 size={17} className="animate-spin" /> Criando conta...</> : "Criar conta"}
          </button>

          <p className="text-center text-white/40 text-sm">
            Já tem conta?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
