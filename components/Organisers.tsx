"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ── Palette ── */
const BLUE   = "#CFE8FF";
const YELLOW = "#FFE9A8";
const GREEN  = "#D7F5D0";
const PINK   = "#FFD6E8";

/* Accents */
const BLUE_ACCENT   = "#5BA4E6";
const PINK_ACCENT   = "#D85C8A";
const GREEN_ACCENT  = "#4CAF50";
const YELLOW_ACCENT = "#C89A2A";

interface Person {
  name: string;
  role: string;
  linkedin: string;
  image?: string;
}

/* ════════════════════════════════════════════════════ */
/* ⚠️  ADD YOUR TRANSPARENT PNG PATHS HERE */
const LEADS: Person[] = [
  { name: "Pranav",    role: "Lead",               linkedin: "https://www.linkedin.com/in/pranav-bansal-0b91412aa/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", image: "/team/pranav.PNG" },
  { name: "Avni",      role: "Lead",               linkedin: "https://www.linkedin.com/in/avni-gupta-186366281/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", image: "/team/avni.PNG" },
  { name: "Kushagra",  role: "Head of Operations", linkedin: "https://www.linkedin.com/in/kushagra-sharma-6b2347245/", image: "/team/kushagra.png" },
];

const ORG_ROW1: Person[] = [
  { name: "Ankit",     role: "Tech Head",     linkedin: "https://www.linkedin.com/in/i-ankit01/", image: "/team/ankit.PNG" },
  { name: "Aayushi",   role: "Tech Head",     linkedin: "https://www.linkedin.com/in/aayushi-nagar-688642279/", image: "/team/aayushi.PNG" },
  { name: "Geetanshi", role: "Content Head",  linkedin: "https://www.linkedin.com/in/geetanshi-goel-49ba5832b/", image: "/team/geetanshi2.PNG" },
  { name: "Bhavya",    role: "Graphics Head", linkedin: "https://www.linkedin.com/in/bhavya-gupta-832366257/", image: "/team/bhavya.PNG" },
  { name: "Prafullit", role: "Outreach Head", linkedin: "https://www.linkedin.com/in/prafullit-bhattacharya-9443b4306/", image: "/team/prafullit.PNG" },
];

const ORG_ROW2: Person[] = [
  { name: "Ansh",  role: "Outreach Head", linkedin: "linkedin.com/in/anshgoyal15032007", image: "/team/ansh.PNG" },
  { name: "Yojit", role: "Visuals Head",  linkedin: "https://www.linkedin.com/in/yojit-tyagi-6a9429316/", image: "/team/yojit.PNG" },
  { name: "Yash",  role: "Socials Head",  linkedin: "https://www.linkedin.com/in/yash-goyal-b3bb8129a/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", image: "/team/yash.PNG" },
  { name: "Daksh", role: "Workflow Head", linkedin: "https://www.linkedin.com/in/daksh-goswami-9607712ba/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", image: "/team/daksh.PNG" },
];

const LinkedInIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

function Separator({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex items-center gap-3 my-10">
      <motion.div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #CFE8FF, #FFE9A8, #D7F5D0, #FFD6E8, transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full shrink-0"
        style={{
          background: "white",
          border: "1.5px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="4"  cy="4"  r="3" fill="#CFE8FF" stroke="#5BA4E6" strokeWidth="1"/>
          <circle cx="12" cy="4"  r="3" fill="#FFE9A8" stroke="#C89A2A" strokeWidth="1"/>
          <circle cx="4"  cy="12" r="3" fill="#D7F5D0" stroke="#4CAF50" strokeWidth="1"/>
          <circle cx="12" cy="12" r="3" fill="#FFD6E8" stroke="#D85C8A" strokeWidth="1"/>
        </svg>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.35em] whitespace-nowrap"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "#888" }}
        >
          {label}
        </span>
      </motion.div>
      <motion.div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #FFD6E8, #D7F5D0, #FFE9A8, #CFE8FF, transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
/* CARD COMPONENT: Premium Lift & Mobile Text Fix */
function PersonCard({
  person, index, delay = 0, bg, accent
}: {
  person: Person; index: number; delay?: number; bg: string; accent: string;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  // A smooth, premium easing curve. Added "as const" to fix TS error.
  const premiumEase = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: delay + index * 0.05 }}
      whileHover="hover"
      whileTap="tap"
      className="group relative w-full cursor-pointer select-none"
      style={{ height: 290 }}
    >
      {/* ── 1. The Card Base (Subtle Lift) ── */}
      <motion.div 
        className="absolute bottom-0 w-full rounded-2xl overflow-hidden"
        style={{ 
          height: 230, 
          background: `linear-gradient(180deg, ${bg} 0%, white 120%)`,
          border: `1px solid ${accent}25`,
          boxShadow: `0 10px 30px -10px ${accent}20`
        }}
        variants={{
          // Card base barely moves to create depth distinction from the photo
          hover: { scale: 1.01, y: -2, boxShadow: `0 15px 35px -5px ${accent}40` },
          tap:   { scale: 0.99, y: 0, boxShadow: `0 8px 20px -5px ${accent}30` }
        }}
        transition={{ duration: 0.4, ease: premiumEase }}
      >
        {/* Soft Glass Fade */}
        <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-white/60 to-transparent" />

        {/* ✨ THE SLOW SHINE ✨ */}
        <motion.div
            className="absolute inset-0 z-10"
            style={{
                background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.0) 60%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{
                duration: 3,             
                repeat: Infinity,        
                repeatDelay: 3 + (index % 3),
                ease: "easeInOut",
                delay: index * 0.2       
            }}
        />
      </motion.div>

      {/* ── 2. The Person Image (Separate, Higher Lift) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-center pointer-events-none z-20 overflow-visible pb-16">
        <motion.div
            className="relative w-auto h-[105%]"
            variants={{
                // Photo lifts much higher and scales to pop out from the card base
                hover: { y: -14, scale: 1.04, transition: { duration: 0.5, ease: premiumEase } },
                tap:   { y: -8, scale: 1.02, transition: { duration: 0.4, ease: premiumEase } }
            }}
        >
            {person.image ? (
                <img 
                    src={person.image} 
                    alt={person.name}
                    className="w-auto h-full object-contain drop-shadow-xl"
                />
            ) : (
                /* Fallback Silhouette */
                <div className="h-[90%] w-[80%] opacity-20 flex items-end justify-center pb-2">
                    <svg viewBox="0 0 24 24" fill={accent} className="w-full h-full">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
            )}
        </motion.div>
      </div>

      {/* ── 3. Floating Name Card (Responsive Text Fix) ── */}
      <motion.div 
        className="absolute bottom-4 left-2 right-2 md:left-3 md:right-3 z-30"
        variants={{
            hover: { y: -4, transition: { duration: 0.4, ease: premiumEase } },
            tap:   { y: -2, transition: { duration: 0.3, ease: premiumEase } }
        }}
      >
        <div 
            // Adjusted padding for mobile to allow text to fit better
            className="rounded-xl px-3 py-2.5 md:px-4 md:py-3 flex items-center justify-between backdrop-blur-md transition-colors duration-200 group-hover:bg-white/95"
            style={{ 
                background: "rgba(255,255,255,0.7)", 
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
            }}
        >
            <div className="flex flex-col min-w-0 flex-1 pr-2">
                {/* Removed truncate, added word wrap so long names fit */}
                <h3 className="text-xs md:text-sm font-bold leading-tight" 
                    style={{ fontFamily: "'Syne', sans-serif", color: "#1a1a1a", wordBreak: "break-word" }}>
                    {person.name}
                </h3>
                {/* Replaced truncate with line-clamp-2 to allow long roles like 'Head of Operations' to wrap */}
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-0.5 line-clamp-2" 
                   style={{ fontFamily: "'DM Sans', sans-serif", color: accent, lineHeight: "1.2" }}>
                    {person.role}
                </span>
            </div>
            
            <a 
                href={person.linkedin}
                target="_blank" rel="noopener noreferrer"
                // Scaled LinkedIn button slightly on mobile
                className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-white hover:bg-blue-50 transition-colors pointer-events-auto shadow-sm flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <LinkedInIcon color="#0077b5" />
            </a>
        </div>
      </motion.div>
    </motion.div>
  );
}



/* ════════════════════════════════════════════════════ */
/* MAIN SECTION */
export default function OrganisersSection() {
  const titleRef    = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const [showAll, setShowAll] = useState(false);

  const allOrganisers = [...LEADS, ...ORG_ROW1, ...ORG_ROW2];

  // Pattern: Pink, Blue, Green, Yellow
  const getColor = (index: number) => {
    if (index < 3) return { bg: PINK, accent: PINK_ACCENT };    // Row 1: Pink
    if (index < 6) return { bg: BLUE, accent: BLUE_ACCENT };    // Row 2: Blue
    if (index < 9) return { bg: GREEN, accent: GREEN_ACCENT };  // Row 3: Green
    return { bg: YELLOW, accent: YELLOW_ACCENT };               // Row 4: Yellow
  };

  return (
    <section className="relative w-full py-20 px-4 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 flex pointer-events-none">
        {[BLUE, YELLOW, GREEN, PINK].map((c, i) => (
          <div key={i} className="flex-1 opacity-[0.07]" style={{ background: c }} />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ── Section title ── */}
        <div ref={titleRef} className="text-center mb-12">
          <motion.p
            className="text-[10px] uppercase tracking-[0.55em] mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#aaa" }}
            initial={{ opacity: 0, y: 10 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            The People Behind It
          </motion.p>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif", lineHeight: 1.1 }}
            initial={{ opacity: 0, y: 28 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{ color: "#2d2d2d" }}>Meet the </span>
            <span style={{ color: "#5BA4E6" }}>Organisers</span>
          </motion.h2>
          
        </div>

        {/* ══════════════════════════════════════
            DESKTOP LAYOUT (md and above)
            3 Cards per row, 4 rows.
        ══════════════════════════════════════ */}
        <div className="hidden md:block">
          <Separator label="The Team" />
          
          {/* Added pt-8 and gap-y-12 to prevent clipping on desktop too */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-12 pt-8 px-4">
            {allOrganisers.map((p, i) => {
              const { bg, accent } = getColor(i);
              return (
                <PersonCard 
                  key={i} 
                  person={p} 
                  index={i} 
                  bg={bg} 
                  accent={accent} 
                  delay={i * 0.05} 
                />
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE LAYOUT (below md)
        ══════════════════════════════════════ */}
        <div className="block md:hidden">
          <Separator label="Organisers" />
          {/* Removed SubLabel here */}

          <div
            className="relative pt-8" // ADDED pt-8 to stop row 1 heads from hitting the top edge
            style={{
              maxHeight: showAll ? "none" : "400px", // INCREASED to accommodate the top padding
              overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
             {/* ADDED gap-y-12 to stop row 2 from overlapping row 1 */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-12">
              {allOrganisers.map((p, i) => {
                 const { bg, accent } = getColor(i);
                 return (
                  <PersonCard key={i} person={p} index={i} bg={bg} accent={accent} delay={i * 0.05} />
                 );
              })}
            </div>

            {!showAll && (
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                  height: "100px",
                  background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,1) 100%)",
                }}
              />
            )}
          </div>

          <div className="flex justify-center mt-5">
            <motion.button
              onClick={() => setShowAll(v => !v)}
              className="relative flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm overflow-hidden"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: "white",
                border: "1.5px solid rgba(91,164,230,0.4)",
                color: "#5BA4E6",
                boxShadow: "0 4px 18px rgba(91,164,230,0.18)",
              }}
              whileHover={{ scale: 1.04, boxShadow: "0 6px 24px rgba(91,164,230,0.28)" }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(207,232,255,0.3) 0%, transparent 60%)" }} />
              <span className="relative z-10">{showAll ? "View Less" : "View All Members"}</span>
              <motion.svg className="relative z-10" width="14" height="14" viewBox="0 0 14 14" fill="none" animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <path d="M2 5l5 5 5-5" stroke="#5BA4E6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            </motion.button>
          </div>
        </div>

      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
    </section>
  );
}