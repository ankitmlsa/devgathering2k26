"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ACCENT, BRAND_GRADIENT, CARD, FIELD, FONT_BODY, FONT_DISPLAY, PRIMARY_BTN, SEMANTIC, cx } from "@/components/staff/theme";

const ADMIN_AREAS = ["/staff/participants", "/staff/meals"];

function destinationFor(role: "admin" | "staff", next: string | null): string {
  if (role === "admin") return next || "/staff/participants";
  // Staff cannot enter admin areas — fall back to the scanner.
  if (next && !ADMIN_AREAS.some((p) => next === p || next.startsWith(p + "/"))) return next;
  return "/staff/scan";
}

function PinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/staff/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Invalid PIN");
        return;
      }
      const role = data?.role === "admin" ? "admin" : "staff";
      router.replace(destinationFor(role, next));
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      className={cx(CARD, "w-full max-w-sm p-7")}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <span
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ background: BRAND_GRADIENT, boxShadow: "0 6px 20px rgba(91,164,230,0.35)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]" style={{ fontFamily: FONT_DISPLAY }}>
          DevGathering <span style={{ color: ACCENT.blue }}>2K26</span>
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#777]" style={{ fontFamily: FONT_BODY }}>
          Staff portal. Enter your PIN — staff for scanning, admin for the full dashboard.
        </p>
      </div>

      <input
        type="password"
        autoFocus
        autoComplete="off"
        value={pin}
        onChange={(e) => setPin(e.target.value.slice(0, 64))}
        placeholder="••••"
        className={cx(FIELD, "text-center text-2xl tracking-[0.4em]")}
      />

      {error ? (
        <p className="mt-3 rounded-xl px-3 py-2 text-center text-sm font-medium" style={{ background: `${SEMANTIC.danger}15`, color: SEMANTIC.danger }}>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || pin.length === 0}
        className={cx(PRIMARY_BTN, "mt-5 w-full py-3.5 text-base")}
        style={{ background: BRAND_GRADIENT, fontFamily: FONT_BODY }}
      >
        {loading ? "Checking…" : "Unlock"}
      </button>
    </motion.form>
  );
}

export default function StaffLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={null}>
        <PinForm />
      </Suspense>
    </main>
  );
}
