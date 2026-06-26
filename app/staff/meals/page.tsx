import MealsTable from "@/components/staff/MealsTable";
import { FONT_DISPLAY } from "@/components/staff/theme";

export const dynamic = "force-dynamic";

export default function MealsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 pb-16 pt-6 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]" style={{ fontFamily: FONT_DISPLAY }}>
        Meal Collection
      </h1>
      <MealsTable />
    </main>
  );
}
