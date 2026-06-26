"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/staff/ConfirmModal";
import { ACCENT, FONT_BODY, PASTEL, SELECT } from "@/components/staff/theme";

// Kept in sync with ROUND_LABELS in lib/staff/rounds.ts (server-only — it imports
// the Postgres pool, so it can't be imported into this client component).
const ROUND_LABELS = ["1", "2", "Final"] as const;

/**
 * Compact inline round selector. Shows the active round as a pill and lets an
 * admin switch it (with a confirm modal). Calls onChange after a change.
 */
export default function RoundControl({ onChange }: { onChange?: (round: string) => void }) {
  const [current, setCurrent] = useState<string>("");
  const [target, setTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/staff/rounds")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCurrent(String(d.current_round)))
      .catch(() => {});
  }, []);

  async function apply() {
    if (!target) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/staff/rounds", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ round: target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to set round");
        return;
      }
      setCurrent(String(data.current_round));
      setTarget(null);
      onChange?.(String(data.current_round));
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const options = Array.from(new Set<string>([...ROUND_LABELS, current].filter(Boolean)));

  return (
    <div className="flex items-center gap-2">
      <span
        className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
        style={{ fontFamily: FONT_BODY, background: PASTEL.blue, color: ACCENT.blue }}
      >
        Round {current || "—"}
      </span>
      <select
        value={current}
        disabled={saving}
        onChange={(e) => {
          if (e.target.value !== current) setTarget(e.target.value);
        }}
        className={SELECT}
        style={{ fontFamily: FONT_BODY }}
        aria-label="Set current round"
      >
        {options.map((r) => (
          <option key={r} value={r}>
            Set round: {r}
          </option>
        ))}
      </select>

      <ConfirmModal
        open={target !== null}
        title={`Advance to Round ${target ?? ""}?`}
        message="This re-enables one fresh meal collection per participant for the new round. Eliminated teams stay eliminated."
        confirmLabel="Set round"
        loading={saving}
        error={error}
        onConfirm={apply}
        onClose={() => {
          if (!saving) {
            setTarget(null);
            setError("");
          }
        }}
      />
    </div>
  );
}
