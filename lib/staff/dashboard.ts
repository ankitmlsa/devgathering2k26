import { query } from "@/lib/staff/db";
import { ensureScannerTables } from "@/lib/staff/schema";
import { listCheckedInParticipants } from "@/lib/staff/participants";
import { getOverrides } from "@/lib/staff/overrides";
import { getTeamStatuses } from "@/lib/staff/teams";
import { getCurrentRound } from "@/lib/staff/rounds";
import { MEAL_SLOTS, type SlotState } from "@/lib/staff/meal-slots";

export type SlotInfo = {
  state: SlotState;
  collected_at: string | null;
  collected_by: string | null;
};

/** One assembled row per checked-in participant, with admin + per-slot meal facts. */
export type ParticipantRow = {
  participant_code: string;
  user_address: string;
  // Effective identity (admin override beats read-only check-in value).
  team_id: string;
  team_name: string;
  participant_name: string;
  // Original check-in identity (shown so admins see what they overrode).
  raw_team_id: string;
  raw_team_name: string;
  raw_participant_name: string;
  overridden: boolean;
  notes: string | null;
  checked_in_at: string | null;
  has_order: boolean;
  eliminated: boolean;
  eliminated_round: string | null;
  collected_count: number;
  // Per meal-slot status, keyed by slot id.
  slots: Record<string, SlotInfo>;
};

export type DashboardData = {
  currentRound: string;
  participants: ParticipantRow[];
};

type OrderRow = {
  user_address: string;
  meal_slot: string;
  status: "pending" | "collected";
  collected_at: string | null;
  collected_by: string | null;
};

/**
 * In-app join across schemas (identity lives in `core.session_state`, admin data
 * in `public.scanner_*`, orders in `public.meal_orders`) — no FK coupling. The
 * dataset is small (hundreds of participants), so we assemble in memory and let
 * the API layer search/sort/filter/paginate. Read-only against the agent's data.
 */
export async function buildDashboard(): Promise<DashboardData> {
  await ensureScannerTables();

  const [participants, overrides, teamStatuses, currentRound, orderRows] = await Promise.all([
    listCheckedInParticipants(),
    getOverrides(),
    getTeamStatuses(),
    getCurrentRound(),
    query<OrderRow>(
      "SELECT user_address, meal_slot, status, collected_at, collected_by FROM public.meal_orders",
    ),
  ]);

  // Group orders per user -> per slot. A participant can have MULTIPLE order rows
  // for the same meal slot (e.g. they re-generated their QR), each with its own
  // verification_code. Only the row whose QR was actually scanned gets flipped to
  // `collected`; the others stay `pending`. The ledger is the authority on whether
  // the meal was served, so a `collected` row must win — otherwise a stray pending
  // duplicate would mask it and the dashboard would show the meal as uncollected
  // even though the scanner already refused to serve it again.
  const ordersByUser = new Map<string, Map<string, OrderRow>>();
  for (const o of orderRows) {
    const m = ordersByUser.get(o.user_address) ?? new Map<string, OrderRow>();
    const existing = m.get(o.meal_slot);
    if (!existing || (existing.status !== "collected" && o.status === "collected")) {
      m.set(o.meal_slot, o);
    }
    ordersByUser.set(o.user_address, m);
  }

  const rows: ParticipantRow[] = participants.map((p) => {
    const ov = overrides.get(p.participant_code);
    const team_id = (ov?.team_id || p.team_id).trim();
    const team_name = (ov?.team_name || p.team_name).trim();
    const participant_name = (ov?.name || p.name).trim();
    const status = teamStatuses.get(team_id);

    const userOrders = ordersByUser.get(p.user_address);
    const slots: Record<string, SlotInfo> = {};
    let collected_count = 0;
    let has_order = false;
    for (const slot of MEAL_SLOTS) {
      const o = userOrders?.get(slot.id);
      if (!o) {
        slots[slot.id] = { state: "none", collected_at: null, collected_by: null };
        continue;
      }
      has_order = true;
      if (o.status === "collected") {
        collected_count += 1;
        slots[slot.id] = { state: "collected", collected_at: o.collected_at, collected_by: o.collected_by };
      } else {
        slots[slot.id] = { state: "ordered", collected_at: null, collected_by: null };
      }
    }

    return {
      participant_code: p.participant_code,
      user_address: p.user_address,
      team_id,
      team_name,
      participant_name,
      raw_team_id: p.team_id,
      raw_team_name: p.team_name,
      raw_participant_name: p.name,
      overridden: Boolean(ov && (ov.team_id || ov.team_name || ov.name)),
      notes: ov?.notes ?? null,
      checked_in_at: p.checked_in_at,
      has_order,
      eliminated: Boolean(status?.eliminated),
      eliminated_round: status?.eliminated_round ?? null,
      collected_count,
      slots,
    };
  });

  return { currentRound, participants: rows };
}

/** A team with its members (max 4 in practice). */
export type TeamGroup = {
  team_id: string;
  team_name: string;
  eliminated: boolean;
  eliminated_round: string | null;
  members: ParticipantRow[];
};

/** Group participant rows by team, members sorted by name. */
export function groupByTeam(participants: ParticipantRow[]): TeamGroup[] {
  const byTeam = new Map<string, TeamGroup>();
  for (const p of participants) {
    let g = byTeam.get(p.team_id);
    if (!g) {
      g = {
        team_id: p.team_id,
        team_name: p.team_name,
        eliminated: p.eliminated,
        eliminated_round: p.eliminated_round,
        members: [],
      };
      byTeam.set(p.team_id, g);
    }
    g.members.push(p);
  }
  for (const g of byTeam.values()) {
    g.members.sort((a, b) =>
      a.participant_name.localeCompare(b.participant_name, undefined, { sensitivity: "base" }),
    );
  }
  return Array.from(byTeam.values());
}
