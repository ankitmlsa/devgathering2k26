This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

It hosts two things from one codebase:

1. **The public event site** at `/` — the DevGathering 2K26 landing page.
2. **The staff portal** at `/staff` — a PIN-gated QR meal-scanning + admin dashboard
   (see [Staff portal](#staff-portal) below). It is mounted on its own route group
   with its own nested layout, so the public site is completely unaffected by it.

## Staff portal

A self-contained portal for event staff, living under `/staff`. It reuses the
public site's theme (Syne + DM Sans, pastel accents, Framer Motion) but paints its
own light canvas and chrome.

### Roles (two PINs)

| PIN | Sees |
|-----|------|
| `SCANNER_STAFF_PIN` | **QR Scan only** — scan/verify a meal QR, view the result. |
| `SCANNER_ADMIN_PIN` | **Everything** — QR Scan + Participants + Meal Collection, eliminate/restore teams, set the round, edit participant overrides, export CSV. |

Login is at `/staff`. The PIN is hashed with the role baked in; the role is verified
server-side in `proxy.ts` **and** in every admin API route (`requireAdmin`) as defense
in depth. The portal is intentionally **not linked from the public nav** — reach it by URL.

### Routes

- **QR Scan** (`/staff/scan`, staff + admin): camera or manual code → `POST /api/staff/verify`.
  Collection is gated by the rules below.
- **Participants** (`/staff/participants`, admin): every checked-in participant grouped
  by team. Search/filter/paginate, eliminate/restore a team, and edit a participant via a
  portal-local **override**.
- **Meal Collection** (`/staff/meals`, admin): per-slot distribution matrix with collection
  times; filter and export CSV.

### Meal collection rules (at scan time)

In strict order — valid QR → team not eliminated → this **meal** not already collected
**this round** → eligible. The round is an admin-controlled global value (`1` / `2` /
`Final`). "One of each meal per participant per round" is enforced by a
`UNIQUE(participant_code, meal_slot, round_number)` on `public.scanner_meal_collection`,
so simultaneous double-scans of the same meal can't double-serve while the participant's
other meals remain independently collectible.

### Data ownership

It talks to the **same Postgres database** (`DATABASE_URL`) the `devgathering-2k26`
agent writes to. It **reads** the agent's data (`public.meal_orders` and the checked-in
profiles in `core.session_state`) and **never modifies** the agent's tables. All of the
portal's own state lives in isolated `public.scanner_*` tables it creates itself on first
use (`ensureScannerTables()`).

### Setup

Copy `.env.example` to `.env.local` and set `SCANNER_STAFF_PIN`, `SCANNER_ADMIN_PIN`,
`DATABASE_URL`, and (recommended) `DEVGATHERING_AGENT_ADDRESS`. The public site needs none
of these and runs without the file. Camera access requires HTTPS in production.

Portal code lives in `app/staff/` (pages), `app/api/staff/` (routes), `lib/staff/`
(server logic), and `components/staff/` (UI), with `proxy.ts` gating only `/staff` +
`/api/staff`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
