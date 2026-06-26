import { query } from "@/lib/staff/db";

/**
 * Idempotent DDL for the portal's OWN tables. These are isolated `scanner_`
 * tables in the `public` schema — we never touch `public.meal_orders`,
 * `core.session_state`, or any shared schema (those belong to the agent).
 *
 * Linkage is by `team_id` (team-level admin state) and `participant_code`
 * (per-participant overlay + per-round collection ledger). No foreign keys to
 * shared tables, since participant identity lives in `core.session_state`.
 */
const DDL = `
create table if not exists public.scanner_event_state (
    id            integer primary key default 1 check (id = 1),
    current_round text   not null default '1',
    updated_at    timestamptz not null default now(),
    updated_by    text
);
insert into public.scanner_event_state (id, current_round)
    values (1, '1') on conflict (id) do nothing;

create table if not exists public.scanner_team_status (
    team_id          text primary key,
    eliminated       boolean not null default false,
    eliminated_round text,
    eliminated_at    timestamptz,
    updated_at       timestamptz not null default now(),
    updated_by       text
);

create table if not exists public.scanner_participant_override (
    participant_code text primary key,
    team_id          text,
    team_name        text,
    name             text,
    notes            text,
    updated_at       timestamptz not null default now(),
    updated_by       text
);

create table if not exists public.scanner_meal_collection (
    id                bigint generated always as identity primary key,
    participant_code  text not null,
    team_id           text not null,
    round_number      text not null,
    verification_code text not null,
    meal_slot         text,
    meal_label        text,
    collected_at      timestamptz not null default now(),
    collected_by      text not null,
    unique (participant_code, round_number)
);
create index if not exists idx_scanner_meal_collection_round
    on public.scanner_meal_collection (round_number);
create index if not exists idx_scanner_meal_collection_team
    on public.scanner_meal_collection (team_id);
`;

let ensured: Promise<void> | null = null;

/**
 * Create the `scanner_` tables if absent. Runs once per server process (guarded
 * by a shared promise); all statements are `IF NOT EXISTS`, so concurrent
 * first-requests on a cold start are safe. Call at the top of every admin/verify
 * handler and admin page loader before the first query.
 */
export function ensureScannerTables(): Promise<void> {
  if (!ensured) {
    ensured = query(DDL).then(() => undefined).catch((err) => {
      // Reset so a transient failure (e.g. DB not yet reachable) can retry.
      ensured = null;
      throw err;
    });
  }
  return ensured;
}
