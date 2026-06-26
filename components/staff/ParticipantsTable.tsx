"use client";

import { useCallback, useEffect, useState } from "react";
import type { MemberView, TeamView } from "@/app/api/staff/participants/route";
import EditParticipantOverlay from "@/components/staff/EditParticipantOverlay";
import ConfirmModal from "@/components/staff/ConfirmModal";
import { LoadingBar } from "@/components/staff/Spinner";
import { ACCENT, CARD, FIELD, FONT_BODY, GHOST_BTN, PASTEL, SELECT, SEMANTIC, cx } from "@/components/staff/theme";

function SkeletonTeams() {
  const bar = "animate-pulse rounded bg-black/[0.06]";
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={cx(CARD, "overflow-hidden")}>
          <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
            <div className="space-y-2">
              <div className={cx(bar, "h-3 w-16")} />
              <div className={cx(bar, "h-4 w-32")} />
            </div>
            <div className={cx(bar, "h-7 w-20 rounded-lg")} />
          </div>
          <div className="space-y-3 px-4 py-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <div className={cx(bar, "h-4 w-36")} />
                <div className={cx(bar, "h-5 w-16 rounded-full")} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type Resp = {
  teams: TeamView[];
  total: number;
  totalParticipants: number;
  page: number;
  pageSize: number;
  currentRound: string;
};

const PAGE_SIZE = 15;

type EditTarget = { member: MemberView; teamId: string; teamName: string };
type ElimTarget = { team: TeamView; eliminate: boolean };

export default function ParticipantsTable() {
  const [q, setQ] = useState("");
  const [eliminated, setEliminated] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [elim, setElim] = useState<ElimTarget | null>(null);
  const [elimBusy, setElimBusy] = useState(false);
  const [elimError, setElimError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, eliminated, page: String(page), pageSize: String(PAGE_SIZE) });
    try {
      const res = await fetch(`/api/staff/participants?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [q, eliminated, page]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function confirmElim() {
    if (!elim) return;
    setElimBusy(true);
    setElimError("");
    try {
      const res = await fetch("/api/staff/participants/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ team_id: elim.team.team_id, eliminated: elim.eliminate }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setElimError(d?.error || "Failed");
        return;
      }
      setElim(null);
      load();
    } catch {
      setElimError("Network error");
    } finally {
      setElimBusy(false);
    }
  }

  const teams = data?.teams ?? [];
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
        <select value={eliminated} onChange={(e) => { setEliminated(e.target.value); setPage(1); }} className={SELECT}>
          <option value="all">All teams</option>
          <option value="active">Active only</option>
          <option value="eliminated">Eliminated only</option>
        </select>
        <span className="ml-auto flex items-center text-sm text-[#999]">
          {loading && data ? <span className="h-3 w-28 animate-pulse rounded bg-black/[0.06]" /> : `${total} team${total === 1 ? "" : "s"} · ${data?.totalParticipants ?? 0} participants`}
        </span>
      </div>

      <LoadingBar active={loading && !!data} />

      {firstLoad ? <SkeletonTeams /> : null}

      {/* Team cards */}
      {!firstLoad ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {teams.map((team) => (
            <div key={team.team_id} className={cx(CARD, "overflow-hidden")}>
              {/* Team header */}
              <div className="flex items-start justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold" style={{ color: ACCENT.blue }}>{team.team_id}</span>
                    {team.eliminated ? (
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${SEMANTIC.danger}15`, color: SEMANTIC.danger }}>
                        Eliminated{team.eliminated_round ? ` · R${team.eliminated_round}` : ""}
                      </span>
                    ) : (
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: PASTEL.green, color: ACCENT.green }}>Active</span>
                    )}
                  </div>
                  <p className="truncate text-base font-bold text-[#1a1a1a]">{team.team_name}</p>
                  <p className="text-[11px] text-[#aaa]">{team.member_count} member{team.member_count === 1 ? "" : "s"}</p>
                </div>
                {team.eliminated ? (
                  <button
                    onClick={() => { setElimError(""); setElim({ team, eliminate: false }); }}
                    className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-[#4CAF50]/10"
                    style={{ borderColor: `${ACCENT.green}55`, color: ACCENT.green }}
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => { setElimError(""); setElim({ team, eliminate: true }); }}
                    className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-[#E05570]/10"
                    style={{ borderColor: `${SEMANTIC.danger}55`, color: SEMANTIC.danger }}
                  >
                    Eliminate
                  </button>
                )}
              </div>

              {/* Members */}
              <ul className="divide-y divide-black/[0.04]">
                {team.members.map((m) => (
                  <li key={m.participant_code} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2d2d2d]">
                        {m.participant_name}
                        {m.overridden ? <span className="ml-1 text-[10px] font-medium" style={{ color: ACCENT.blue }}>(edited)</span> : null}
                      </p>
                      <p className="text-[11px] text-[#aaa]">
                        {m.checked_in_at ? `Checked in ${new Date(m.checked_in_at).toLocaleString()}` : "Not checked in"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {m.qr_status === "ordered" ? (
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: PASTEL.blue, color: ACCENT.blue }}>QR ready</span>
                      ) : (
                        <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[#999]">No order</span>
                      )}
                      <button
                        onClick={() => setEditing({ member: m, teamId: team.team_id, teamName: team.team_name })}
                        className="rounded-md border border-black/10 px-2 py-1 text-xs font-medium text-[#555] transition hover:border-black/20 hover:text-[#1a1a1a]"
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {teams.length === 0 && !loading && !firstLoad ? (
        <div className={cx(CARD, "px-4 py-10 text-center text-[#999]")}>No teams match.</div>
      ) : null}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#777]">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={cx(GHOST_BTN, "px-3 py-1.5")}>Prev</button>
        <span className="text-[#999]">Page {data?.page ?? page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={cx(GHOST_BTN, "px-3 py-1.5")}>Next</button>
      </div>

      {/* Edit override */}
      {editing ? (
        <EditParticipantOverlay
          member={editing.member}
          currentTeamId={editing.teamId}
          currentTeamName={editing.teamName}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      ) : null}

      {/* Eliminate / restore confirm */}
      <ConfirmModal
        open={elim !== null}
        title={elim?.eliminate ? "Eliminate team?" : "Restore team?"}
        message={
          elim
            ? elim.eliminate
              ? `Eliminate "${elim.team.team_name}" (${elim.team.team_id})? Its members will be blocked from collecting meals.`
              : `Restore "${elim.team.team_name}" (${elim.team.team_id})? Its members can collect meals again.`
            : ""
        }
        confirmLabel={elim?.eliminate ? "Eliminate" : "Restore"}
        danger={elim?.eliminate}
        loading={elimBusy}
        error={elimError}
        onConfirm={confirmElim}
        onClose={() => { if (!elimBusy) { setElim(null); setElimError(""); } }}
      />
    </div>
  );
}
