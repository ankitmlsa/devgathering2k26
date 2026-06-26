"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import ResultCard from "@/components/staff/ResultCard";
import type { VerifyResult } from "@/lib/staff/orders";
import { ACCENT, BRAND_GRADIENT, FIELD, FONT_BODY, FONT_DISPLAY, PASTEL, PRIMARY_BTN, SEMANTIC, cx } from "@/components/staff/theme";

type Phase = "scanning" | "checking" | "result";

const STAFF_NAME_KEY = "dg_scanner_staff_name";

export default function ScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("scanning");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [staffName, setStaffName] = useState("");
  const [round, setRound] = useState<string | null>(null);

  // Load the operator label + current round once on mount. Reading from
  // localStorage is a legitimate external-store sync; the rule's escape hatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STAFF_NAME_KEY) ?? "";
      if (saved) setStaffName(saved);
    } catch {
      /* ignore */
    }
    fetch("/api/staff/rounds")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setRound(String(d.current_round)))
      .catch(() => {});
  }, []);

  const onStaffNameChange = (value: string) => {
    setStaffName(value);
    try {
      localStorage.setItem(STAFF_NAME_KEY, value);
    } catch {
      /* ignore */
    }
  };

  const verify = useCallback(
    async (raw: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setError("");
      setPhase("checking");
      try {
        const res = await fetch("/api/staff/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: raw, staff_name: staffName.trim() }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok && res.status !== 404) {
          setError(data?.error || "Verification failed");
          setPhase("scanning");
          busyRef.current = false;
          return;
        }
        setResult(data as VerifyResult);
        setPhase("result");
      } catch {
        setError("Network error. Try again.");
        setPhase("scanning");
        busyRef.current = false;
      }
    },
    [staffName],
  );

  useEffect(() => {
    if (phase !== "scanning") return;
    let cancelled = false;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decoded) => {
            verify(decoded);
          },
          () => {
            /* per-frame decode errors are expected; ignore */
          },
        );
      } catch {
        if (!cancelled) {
          setError("Couldn't start the camera. Grant camera permission or enter the code manually.");
        }
      }
    })();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        scanner.stop().catch(() => {}).finally(() => scanner.clear());
      }
    };
  }, [phase, verify]);

  function scanNext() {
    setResult(null);
    setError("");
    busyRef.current = false;
    setPhase("scanning");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-4 pb-16 pt-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a]" style={{ fontFamily: FONT_DISPLAY }}>
          Scan meal QR
        </h1>
        {round ? (
          <span
            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ fontFamily: FONT_BODY, background: PASTEL.blue, color: ACCENT.blue }}
          >
            Round {round}
          </span>
        ) : null}
      </div>

      {phase === "scanning" ? (
        <>
          <div className="relative w-full">
            <div
              id="reader"
              className="aspect-square w-full overflow-hidden rounded-3xl border border-black/10 bg-black shadow-[0_8px_30px_rgba(0,0,0,0.12)] [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
            />
            <div className="pointer-events-none absolute inset-0 m-8 rounded-2xl">
              <span className="absolute left-0 top-0 h-7 w-7 rounded-tl-2xl border-l-4 border-t-4 border-white/80" />
              <span className="absolute right-0 top-0 h-7 w-7 rounded-tr-2xl border-r-4 border-t-4 border-white/80" />
              <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-2xl border-b-4 border-l-4 border-white/80" />
              <span className="absolute bottom-0 right-0 h-7 w-7 rounded-br-2xl border-b-4 border-r-4 border-white/80" />
              <span
                className="absolute inset-x-2 top-2 h-0.5 rounded"
                style={{
                  background: `linear-gradient(90deg, transparent, ${ACCENT.blue}, transparent)`,
                  animation: "dg-scanline 2.2s ease-in-out infinite",
                }}
              />
            </div>
          </div>
          <p className="text-sm text-[#777]" style={{ fontFamily: FONT_BODY }}>
            Point the camera at a participant&apos;s meal QR.
          </p>

          {error ? (
            <p className="w-full rounded-xl px-3 py-2 text-center text-sm font-medium" style={{ background: `${SEMANTIC.danger}15`, color: SEMANTIC.danger }}>
              {error}
            </p>
          ) : null}

          <input
            value={staffName}
            onChange={(e) => onStaffNameChange(e.target.value)}
            placeholder="Your name (optional — recorded as approver)"
            className={FIELD}
            style={{ fontFamily: FONT_BODY }}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) verify(manualCode.trim());
            }}
            className="flex w-full gap-2"
          >
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or enter code manually"
              className={cx(FIELD, "flex-1")}
              style={{ fontFamily: FONT_BODY }}
            />
            <button type="submit" className={cx(PRIMARY_BTN, "px-5")} style={{ background: BRAND_GRADIENT, fontFamily: FONT_BODY }}>
              Verify
            </button>
          </form>
        </>
      ) : null}

      {phase === "checking" ? (
        <div className="flex flex-col items-center gap-3 py-10 text-[#777]" style={{ fontFamily: FONT_BODY }}>
          <span
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{ borderColor: "rgba(91,164,230,0.2)", borderTopColor: ACCENT.blue }}
          />
          <p>Verifying…</p>
        </div>
      ) : null}

      {phase === "result" && result ? (
        <>
          <ResultCard status={result.status} order={result.order} round={result.round} />
          <button onClick={scanNext} className={cx(PRIMARY_BTN, "px-8 py-3.5 text-base")} style={{ background: BRAND_GRADIENT, fontFamily: FONT_BODY }}>
            Scan next
          </button>
        </>
      ) : null}

      <style>{`@keyframes dg-scanline { 0% { transform: translateY(0); opacity: 0.15; } 50% { opacity: 0.9; } 100% { transform: translateY(230px); opacity: 0.15; } }`}</style>
    </main>
  );
}
