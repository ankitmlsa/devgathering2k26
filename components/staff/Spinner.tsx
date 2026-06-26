import { ACCENT } from "@/components/staff/theme";

/** Small accent-colored spinner. */
export default function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: "rgba(91,164,230,0.2)",
        borderTopColor: ACCENT.blue,
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Thin indeterminate progress bar — place at the top of a panel during refetch. */
export function LoadingBar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-[#5BA4E6]/10">
      <span
        className="absolute inset-y-0 left-0 w-1/4 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, #5BA4E6, #E8916E, transparent)",
          animation: "dg-loadingbar 1.1s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes dg-loadingbar { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
    </div>
  );
}
