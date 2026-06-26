import RoundControl from "@/components/staff/RoundControl";
import ParticipantsTable from "@/components/staff/ParticipantsTable";
import { FONT_DISPLAY } from "@/components/staff/theme";

export const dynamic = "force-dynamic";

export default function ParticipantsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 pb-16 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]" style={{ fontFamily: FONT_DISPLAY }}>
          Participants
        </h1>
        <RoundControl />
      </div>
      <ParticipantsTable />
    </main>
  );
}
