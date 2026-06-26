"use client";

import { useCallback, useEffect, useState } from "react";
import { MEAL_SLOTS, type MealSlotDef, type SlotState } from "@/lib/staff/meal-slots";
import type { SlotInfo } from "@/lib/staff/dashboard";
import type { MealMatrixRow } from "@/app/api/staff/meals/route";
import { LoadingBar } from "@/components/staff/Spinner";
import { ACCENT, BRAND_GRADIENT, CARD, FIELD, FONT_BODY, GHOST_BTN, SELECT, SEMANTIC, cx } from "@/components/staff/theme";

type Resp = {
  rows: MealMatrixRow[];
  total: number;
  page: number;
  pageSize: number;
  currentRound: string;
  slots: MealSlotDef[];
};

const PAGE_SIZE = 25;

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Cell({ info }: { info: SlotInfo }) {
  if (info.state === "collected") {
    const full = info.collected_at
      ? `Collected ${new Date(info.collected_at).toLocaleString()}${info.collected_by ? ` · by ${info.collected_by}` : ""}`
      : "Collected";
    return (
      <span className="inline-flex flex-col items-center gap-0.5" title={full}>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold" style={{ background: `${SEMANTIC.success}22`, color: SEMANTIC.success }}>✓</span>
        {info.collected_at ? (
          <span className="text-[10px] leading-none" style={{ color: `${SEMANTIC.success}cc` }}>{fmtTime(info.collected_at)}</span>
        ) : null}
      </span>
    );
  }
  if (info.state === "ordered")
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs" style={{ background: `${SEMANTIC.warning}1f`, color: SEMANTIC.warning }} title="Ordered, not collected">◷</span>
    );
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#ccc]" title="No order">—</span>
  );
}

const NONE: SlotInfo = { state: "none", collected_at: null, collected_by: null };
function legendInfo(state: SlotState): SlotInfo {
  return { state, collected_at: null, collected_by: null };
}

function SkeletonMatrix({ cols }: { cols: number }) {
  const bar = "animate-pulse rounded bg-black/[0.06]";
  return (
    <div className={cx(CARD, "overflow-hidden p-4")}>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cx(bar, "h-8 w-28")} />
            <div className={cx(bar, "h-4 w-40")} />
            <div className="ml-auto flex gap-3">
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className={cx(bar, "h-6 w-6 rounded-md")} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MealsTable() {
  const [q, setQ] = useState("");
  const [collected, setCollected] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);

  const buildParams = useCallback(() => new URLSearchParams({ q, collected }), [q, collected]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = buildParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    try {
      const res = await fetch(`/api/staff/meals?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [buildParams, page]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const rows = data?.rows ?? [];
  const slots = data?.slots ?? MEAL_SLOTS;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstLoad = !data && loading;

  return (
    <div className="space-y-4" style={{ fontFamily: FONT_BODY }}>
      {/* Controls */}
      <div className={cx(CARD, "flex flex-wrap items-center gap-2 px-4 py-3")}>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search team ID, team name, or participant…"
          className={cx(FIELD, "min-w-[14rem] flex-1")}
        />
        <select value={collected} onChange={(e) => { setCollected(e.target.value); setPage(1); }} className={SELECT}>
          <option value="all">All participants</option>
          <option value="any">Collected ≥ 1 meal</option>
          <option value="none">Collected nothing</option>
        </select>
        <a
          href={`/api/staff/meals/export?${buildParams()}`}
          className="inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_3px_14px_rgba(91,164,230,0.38)] transition hover:brightness-105"
          style={{ background: BRAND_GRADIENT }}
        >
          Export CSV
        </a>
        <span className="flex w-full items-center justify-end gap-2 text-sm text-[#999] sm:w-auto">
          {loading && data ? <span className="h-3 w-16 animate-pulse rounded bg-black/[0.06]" /> : `${total} participant${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1 text-xs text-[#999]">
        <span className="flex items-center gap-1"><Cell info={legendInfo("collected")} /> Collected (with time)</span>
        <span className="flex items-center gap-1"><Cell info={legendInfo("ordered")} /> Ordered, not collected</span>
        <span className="flex items-center gap-1"><Cell info={NONE} /> No order</span>
      </div>

      <LoadingBar active={loading && !!data} />

      {firstLoad ? (
        <SkeletonMatrix cols={slots.length} />
      ) : (
        <div className={cx(CARD, "overflow-x-auto")}>
          <table className="w-full text-sm">
            <thead className="border-b border-black/[0.06] text-[#999]">
              <tr>
                <th className="sticky left-0 z-10 bg-white/90 px-3 py-2.5 text-left font-semibold backdrop-blur">Team ID</th>
                <th className="px-3 py-2.5 text-left font-semibold">Participant</th>
                {slots.map((s) => (
                  <th key={s.id} className="px-3 py-2.5 text-center font-semibold" title={s.label}>{s.short}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.participant_code} className="border-b border-black/[0.04] transition hover:bg-[#5BA4E6]/[0.04]">
                  <td className="sticky left-0 z-10 bg-white/80 px-3 py-2.5 font-mono text-xs backdrop-blur">
                    <span className="font-semibold" style={{ color: ACCENT.blue }}>{r.team_id}</span>
                    <span className="block text-[10px] text-[#aaa]">{r.team_name}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[#2d2d2d]">{r.participant_name}</td>
                  {slots.map((s) => (
                    <td key={s.id} className="px-3 py-2.5 text-center align-top">
                      <Cell info={r.slots[s.id] ?? NONE} />
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && !loading ? (
                <tr><td colSpan={slots.length + 2} className="px-3 py-8 text-center text-[#999]">No participants match.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#777]">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={cx(GHOST_BTN, "px-3 py-1.5")}>Prev</button>
        <span className="text-[#999]">Page {data?.page ?? page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={cx(GHOST_BTN, "px-3 py-1.5")}>Next</button>
      </div>
    </div>
  );
}
