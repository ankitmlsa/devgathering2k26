import type { Metadata } from "next";
import PortalNav from "@/components/staff/PortalNav";
import { getRole } from "@/lib/staff/rbac";

export const metadata: Metadata = {
  title: "DevGathering 2K26 · Staff Portal",
  description: "Staff portal for QR meal scanning, participants, and meal collection at DevGathering 2K26.",
};

/**
 * Nested layout for the entire staff portal. It renders inside the public site's
 * root layout (so it inherits the fonts, custom cursor, and analytics) but paints
 * its own reliably-light pastel canvas so the portal stays readable regardless of
 * the visitor's OS dark-mode preference.
 */
export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#2d2d2d]">
      {/* Light pastel canvas — mirrors the washes used across the public site. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 50rem at 50% -18rem, rgba(91,164,230,0.10), transparent), radial-gradient(40rem 40rem at 100% 0%, rgba(232,145,110,0.08), transparent), radial-gradient(44rem 44rem at 0% 100%, rgba(76,175,80,0.08), transparent), #fdfdff",
        }}
      />

      <PortalNav role={role} />
      {children}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}
