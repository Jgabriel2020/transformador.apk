"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, Sparkles, History, LogIn, LogOut, UserPlus } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Converter", icon: Package },
  { href: "/melhorar", label: "Melhorar com IA", icon: Sparkles },
  { href: "/historico", label: "Histórico", icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Package size={18} />
          </div>
          APK Builder
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                pathname === href
                  ? "bg-brand-600 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <span className="text-white/50 text-sm hidden sm:block">
                Olá, <span className="text-white font-medium">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut size={15} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogIn size={15} /> Entrar
              </Link>
              <Link
                href="/cadastro"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all"
              >
                <UserPlus size={15} /> Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
