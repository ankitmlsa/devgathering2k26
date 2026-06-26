/**
 * The fixed meal catalog, matching the agent's
 * `services/menu_parser.py` MEAL_SLOTS (chronological order). This file has NO
 * server dependency, so it is safe to import from client components.
 */
export type MealSlotDef = {
  id: string;
  short: string; // compact column header
  label: string; // full label (tooltips / CSV)
};

export const MEAL_SLOTS: MealSlotDef[] = [
  { id: "day1_lunch", short: "D1 Lunch", label: "Day 1 — Lunch" },
  { id: "day1_snack", short: "D1 Snack", label: "Day 1 — Evening Snack" },
  { id: "day1_dinner", short: "D1 Dinner", label: "Day 1 — Dinner" },
  { id: "day1_midnight_snack", short: "Midnight", label: "Day 1 — Midnight Snack" },
  { id: "day2_breakfast", short: "D2 Breakfast", label: "Day 2 — Breakfast" },
  { id: "day2_lunch", short: "D2 Lunch", label: "Day 2 — Lunch" },
];

export type SlotState = "collected" | "ordered" | "none";
