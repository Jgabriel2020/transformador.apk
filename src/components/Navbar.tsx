"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Sparkles, History } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Converter", icon: Package },
  { href: "/melhorar", label: "Melhorar com IA", icon: Sparkles },
  { href: "/historico", label: "Histórico", icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Package size={18} />
          </div>
          APK Builder
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
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
      </div>
    </nav>
  );
}
