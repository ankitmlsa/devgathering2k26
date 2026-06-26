"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Role } from "@/lib/staff/auth";
import { ACCENT, FONT_BODY, FONT_DISPLAY, PASTEL } from "@/components/staff/theme";

type Tab = { href: string; label: string; adminOnly: boolean; accent: string; bg: string };

const TABS: Tab[] = [
  { href: "/staff/scan", label: "QR Scan", adminOnly: false, accent: ACCENT.blue, bg: PASTEL.blue },
  { href: "/staff/participants", label: "Participants", adminOnly: true, accent: ACCENT.pink, bg: PASTEL.pink },
  { href: "/staff/meals", label: "Meal Collection", adminOnly: true, accent: ACCENT.green, bg: PASTEL.green },
];

export default function PortalNav({ role }: { role: Role | null }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Hide the whole shell on the login screen / when signed out.
  if (!role || pathname === "/staff") return null;

  const tabs = TABS.filter((t) => !t.adminOnly || role === "admin");

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/staff/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/staff");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-[100] px-3 pt-3">
      <div
        className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-black/[0.06] px-4 py-2.5"
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          boxShadow: "0 6px 28px rgba(0,0,0,0.05)",
        }}
      >
        {/* Rainbow hairline */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #CFE8FF, #FFE9A8, #D7F5D0, #FFD6E8, #CFE8FF)" }}
        />

        {/* Wordmark */}
        <Link href="/staff/scan" className="flex shrink-0 flex-col leading-none">
          <span className="font-black tracking-tight" style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            Dev<span style={{ color: ACCENT.blue }}>Gathering</span>
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-[0.32em]" style={{ fontFamily: FONT_BODY, color: "#bbb" }}>
            Staff Portal
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                className="relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold outline-none"
                style={{ fontFamily: FONT_BODY, color: active ? t.accent : "#666", textDecoration: "none" }}
              >
                {active ? (
                  <motion.span
                    layoutId="staff-nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: t.bg, border: `1px solid ${t.accent}35` }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{t.label}</span>
              </Link>
            );
          })}
        </nav>

        <span
          className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:inline"
          style={{
            fontFamily: FONT_BODY,
            background: role === "admin" ? PASTEL.pink : PASTEL.blue,
            color: role === "admin" ? ACCENT.pink : ACCENT.blue,
          }}
        >
          {role}
        </span>

        <button
          onClick={logout}
          disabled={loggingOut}
          className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-[12.5px] font-medium text-[#666] transition hover:border-black/20 hover:text-[#1a1a1a] disabled:opacity-50"
          style={{ fontFamily: FONT_BODY }}
        >
          {loggingOut ? "…" : "Log out"}
        </button>
      </div>
    </header>
  );
}
