"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, User, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login({ id: data.id, username: data.username });
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <Package size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Entrar</h1>
          <p className="text-white/50 mt-1">Acesse sua conta APK Builder</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-8 space-y-5">
          {/* Username */}
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
                required
              />
            </div>
          </div>

          {/* Password */}
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
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
            {loading ? <><Loader2 size={17} className="animate-spin" /> Entrando...</> : "Entrar"}
          </button>

          <p className="text-center text-white/40 text-sm">
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
