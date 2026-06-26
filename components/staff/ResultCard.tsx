import { motion } from "framer-motion";
import type { MealOrder, VerifyStatus } from "@/lib/staff/orders";
import { CARD, FONT_BODY, FONT_DISPLAY, cx } from "@/components/staff/theme";

type Meta = {
  title: string;
  note: string;
  band: string; // CSS gradient for the header band
  icon: React.ReactNode;
};

const CHECK = (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const WARN = (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
);
const CROSS = (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const BAN = (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="m5.6 5.6 12.8 12.8" />
  </svg>
);

const STATUS_META: Record<VerifyStatus, Meta> = {
  collected: {
    title: "Collected",
    note: "Hand over this meal.",
    band: "linear-gradient(135deg, #4CAF50, #2f9e44)",
    icon: CHECK,
  },
  already_collected: {
    title: "Already collected",
    note: "This QR was already scanned — do not serve again.",
    band: "linear-gradient(135deg, #E8916E, #d97539)",
    icon: WARN,
  },
  already_collected_round: {
    title: "Already collected",
    note: "Meal has already been collected for this round.",
    band: "linear-gradient(135deg, #E8916E, #d97539)",
    icon: WARN,
  },
  eliminated: {
    title: "Team eliminated",
    note: "Your team has been eliminated in the current round. Meal collection is no longer available.",
    band: "linear-gradient(135deg, #D85C8A, #b23a6a)",
    icon: BAN,
  },
  not_found: {
    title: "Not found",
    note: "No order matches this QR. Ask the participant to re-order in chat.",
    band: "linear-gradient(135deg, #E05570, #c23a55)",
    icon: CROSS,
  },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <span className="text-[#999]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-right font-semibold text-[#2d2d2d]" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  );
}

export default function ResultCard({
  status,
  order,
  round,
}: {
  status: VerifyStatus;
  order: MealOrder | null;
  round?: string | null;
}) {
  const meta = STATUS_META[status];
  return (
    <motion.div
      className={cx(CARD, "w-full max-w-md overflow-hidden p-0")}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-white" style={{ background: meta.band }}>
        <motion.span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/15"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
        >
          {meta.icon}
        </motion.span>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>{meta.title}</h2>
        <p className="max-w-xs text-center text-sm text-white/90" style={{ fontFamily: FONT_BODY }}>{meta.note}</p>
        {status === "collected" && round ? (
          <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Round {round}
          </span>
        ) : null}
      </div>

      {order ? (
        <div className="px-6 py-5">
          <div className="divide-y divide-black/[0.06]">
            <Row label="Participant" value={order.participant_name} />
            <Row label="Team" value={`${order.team_name} (${order.team_id})`} />
            <Row label="Meal" value={order.meal_label} />
            <Row label="Code" value={order.verification_code} />
            {order.collected_at ? (
              <Row label="Collected at" value={new Date(order.collected_at).toLocaleString()} />
            ) : null}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
