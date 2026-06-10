"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

/* ── Palette ── */
const BLUE   = "#CFE8FF";
const YELLOW = "#FFE9A8";
const GREEN  = "#D7F5D0";
const PINK   = "#FFD6E8";

/* ══════════════════════════════════════════════════════
   LOTTIE CONFETTI OVERLAY
══════════════════════════════════════════════════════ */
function LottieConfettiOverlay({ active, onDone }: { active: boolean; onDone: () => void }) {
  const playerRef = useRef<HTMLElement & { play: () => void }>(null);

  useEffect(() => {
    if (document.querySelector('script[data-lottie-cdn]')) return;
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@lottiefiles/lottie-player@2/dist/lottie-player.js";
    s.setAttribute("data-lottie-cdn", "1");
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onDone, 4200);
    return () => clearTimeout(timer);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" style={{ overflow: "hidden" }}>
      {/* @ts-ignore */}
      <lottie-player
        ref={playerRef}
        src="/celebrate2.json"
        background="transparent"
        speed="1"
        autoplay
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.22, 0] }}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        <div style={{
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 68%)",
        }} />
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SCRATCH CARD
══════════════════════════════════════════════════════ */
function ScratchCard({ onRevealed }: { onRevealed: () => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDrawing  = useRef(false);
  const revealed   = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0,    "#2a2e35");
    base.addColorStop(0.45, "#3a3f4a");
    base.addColorStop(1,    "#1e2229");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 3200; i++) {
      const tx = Math.random() * W;
      const ty = Math.random() * H;
      const a  = Math.random() * 0.06;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(tx, ty, 1.2, 1.2);
    }

    const shine = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
    shine.addColorStop(0,    "transparent");
    shine.addColorStop(0.42, "rgba(255,255,255,0.07)");
    shine.addColorStop(0.5,  "rgba(255,255,255,0.13)");
    shine.addColorStop(0.58, "rgba(255,255,255,0.07)");
    shine.addColorStop(1,    "transparent");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.font = "900 64px 'Syne', 'Arial Black', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.15);
    ctx.fillText("PRIZE POOL", 0, 0);
    ctx.restore();

    ctx.font = "800 18px 'Syne', 'Arial Black', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦  Scratch to Reveal  ✦", W / 2, H / 2 - 2);

    ctx.font = "500 12px 'DM Sans', 'Helvetica Neue', sans-serif";
    ctx.fillStyle = "rgba(220,230,245,0.68)";
    ctx.fillText("drag your finger or mouse anywhere", W / 2, H / 2 + 26);

    for (let r = 0; r < H; r += 14) {
      for (let c = 0; c < W; c += 14) {
        ctx.beginPath();
        ctx.arc(c, r, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,220,255,0.10)";
        ctx.fill();
      }
    }

    const topHighlight = ctx.createLinearGradient(0, 0, W, 0);
    topHighlight.addColorStop(0, "transparent");
    topHighlight.addColorStop(0.3, "rgba(255,255,255,0.12)");
    topHighlight.addColorStop(0.7, "rgba(255,255,255,0.12)");
    topHighlight.addColorStop(1, "transparent");
    ctx.fillStyle = topHighlight;
    ctx.fillRect(0, 0, W, 2);
  }, []);

  const checkThreshold = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }
    const ratio = transparent / (canvas.width * canvas.height);
    if (ratio > 0.18) {
      revealed.current = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDone(true);
      onRevealed();
    }
  }, [onRevealed]);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc((x - rect.left) * scaleX, (y - rect.top) * scaleY, 36, 0, Math.PI * 2);
    ctx.fill();
    checkThreshold();
  }, [checkThreshold]);

  const onMouseDown  = (e: React.MouseEvent)  => { isDrawing.current = true; scratch(e.clientX, e.clientY); };
  const onMouseMove  = (e: React.MouseEvent)  => { if (isDrawing.current) scratch(e.clientX, e.clientY); };
  const onTouchStart = (e: React.TouchEvent)  => { isDrawing.current = true; scratch(e.touches[0].clientX, e.touches[0].clientY); };
  const onTouchMove  = (e: React.TouchEvent)  => { e.preventDefault(); scratch(e.touches[0].clientX, e.touches[0].clientY); };
  const onEnd        = ()                      => { isDrawing.current = false; };

  return (
    <div className="relative select-none" style={{ touchAction: "none" }}>
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ background: YELLOW, outline: "1.5px solid rgba(200,154,42,0.35)" }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(200,154,42,0.22) 1px, transparent 1px)",
          backgroundSize: "13px 13px", opacity: 0.55,
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(140deg, rgba(255,255,255,0.58) 0%, transparent 52%)",
        }} />
        {["₹","$","₹","$","₹"].map((sym, i) => (
          <div key={i} className="absolute pointer-events-none select-none" style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 900,
            fontSize: 52 + (i % 3) * 16, color: "rgba(200,154,42,0.1)",
            left: `${10 + i * 18}%`, top: `${15 + (i % 2) * 40}%`,
            transform: `rotate(${-15 + i * 12}deg)`, userSelect: "none",
          }}>{sym}</div>
        ))}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{
          background: "linear-gradient(90deg, transparent, rgba(200,154,42,0.9) 40%, #C89A2A 50%, rgba(200,154,42,0.9) 60%, transparent)",
        }} />
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-40" style={{ background: "#C89A2A" }} />

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={done ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] uppercase tracking-[0.5em] font-semibold"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#92701a" }}>
            Total Prize Pool
          </p>
          <motion.p
            className="font-black leading-none"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(40px, 10vw, 68px)",
              color: "#78350f",
              letterSpacing: "-0.03em",
              textShadow: "0 2px 0 rgba(200,154,42,0.25)",
            }}
            animate={done ? { scale: [0.85, 1.08, 1] } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            $4,00,000
          </motion.p>
          <p className="text-xs uppercase tracking-[0.42em]"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(120,53,15,0.5)" }}>
            in prizes &amp; goodies
          </p>
        </motion.div>
      </div>

      <canvas
        ref={canvasRef}
        width={560}
        height={190}
        className="relative z-10 w-full rounded-2xl"
        style={{
          cursor: done ? "default" : "crosshair",
          display: done ? "none" : "block",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onEnd}
      />
      {done && <div style={{ height: 190 }} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRIZE CARDS
══════════════════════════════════════════════════════ */
const PRIZES = [
  { rank: "1st", label: "First Place",  amount: "₹12,000", LucideIcon: Trophy, accent: "#5BA4E6", bg: BLUE,   iconColor: "#5BA4E6" },
  { rank: "2nd", label: "Second Place", amount: "₹8,000",  LucideIcon: Medal,  accent: "#4CAF50", bg: GREEN,  iconColor: "#4CAF50" },
  { rank: "3rd", label: "Third Place",  amount: "₹5,000",  LucideIcon: Award,  accent: "#D85C8A", bg: PINK,   iconColor: "#D85C8A" },
];

const CARD_SIZES = [
  { padding: "32px 20px 28px", iconBox: 72, iconSize: 34, nameSize: 20, rankFontSize: 96, amountSize: 32 },
  { padding: "24px 18px 22px", iconBox: 60, iconSize: 28, nameSize: 17, rankFontSize: 80, amountSize: 26 },
  { padding: "20px 16px 18px", iconBox: 54, iconSize: 24, nameSize: 15, rankFontSize: 72, amountSize: 22 },
];

function Separator({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex items-center gap-4 my-10">
      <motion.div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #CFE8FF, #FFE9A8, #D7F5D0, #FFD6E8, transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full"
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

function PrizeCard({ prize, sizeIndex, animIndex }: {
  prize: typeof PRIZES[0];
  sizeIndex: number;
  animIndex: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const sz     = CARD_SIZES[sizeIndex];
  const { LucideIcon } = prize;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 38, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.58, delay: animIndex * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -7, scale: 1.03 }}
      className="relative flex flex-col items-center overflow-hidden rounded-2xl cursor-default w-full"
      style={{
        background: prize.bg,
        outline: `1.5px solid ${prize.accent}42`,
        outlineOffset: 0,
        boxShadow: `0 0 0 4px ${prize.accent}10, 0 10px 32px ${prize.accent}22, inset 0 1px 0 rgba(255,255,255,0.85)`,
        padding: sz.padding,
      }}
    >
      <motion.div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(108deg, transparent 28%, rgba(255,255,255,0.52) 50%, transparent 72%)",
        backgroundSize: "200% 100%",
      }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear", repeatDelay: 1.8 }}
      />
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: "linear-gradient(140deg, rgba(255,255,255,0.55) 0%, transparent 50%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${prize.accent}28 1px, transparent 1px)`,
          backgroundSize: "13px 13px", opacity: 0.45, borderRadius: "inherit",
        }} />
      <motion.div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${prize.accent}bb 35%, ${prize.accent} 50%, ${prize.accent}bb 65%, transparent)`,
          borderRadius: "16px 16px 0 0",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: animIndex * 0.12 + 0.2 }}
      />
      <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full opacity-50"
        style={{ background: prize.accent }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 900,
          fontSize: sz.rankFontSize, color: prize.accent,
          opacity: 0.07, letterSpacing: "-0.04em",
        }}>
        {prize.rank}
      </div>
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{
          width: sz.iconBox + 18, height: sz.iconBox + 18,
          border: `1.5px solid ${prize.accent}40`,
          top: parseInt(sz.padding) - 4,
          left: "50%", translateX: "-50%",
        }}
        animate={{ scale: [1, 1.28], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="relative z-10 flex items-center justify-center rounded-xl"
        style={{
          width: sz.iconBox, height: sz.iconBox,
          background: "rgba(255,255,255,0.6)",
          border: `1.5px solid ${prize.accent}28`,
          boxShadow: `0 0 0 4px ${prize.accent}12`,
          backdropFilter: "blur(4px)",
        }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.45, delay: animIndex * 0.12 + 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <LucideIcon size={sz.iconSize} color={prize.iconColor} strokeWidth={1.7} />
      </motion.div>

      <p className="relative z-10 font-black mt-3 tracking-tight"
        style={{ fontFamily: "'Syne', sans-serif", fontSize: sz.nameSize, color: "#1a1a1a" }}>
        {prize.label}
      </p>

      <div className="w-3/4 my-2.5 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${prize.accent}55, transparent)` }} />

      {/* ── Prize amount — replaces "To be revealed" ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-0.5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: animIndex * 0.12 + 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className="font-black leading-none tracking-tight"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: sz.amountSize,
            color: prize.accent,
            textShadow: `0 2px 8px ${prize.accent}44`,
          }}
        >
          {prize.amount}
        </p>
        <p className="text-[9px] uppercase tracking-[0.38em] font-semibold"
          style={{ fontFamily: "'DM Sans', sans-serif", color: prize.accent, opacity: 0.65 }}>
          Cash Prize
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   PRIZE POOL SECTION — default export
══════════════════════════════════════════════════════ */
export default function PrizePoolSection() {
  const [revealed, setRevealed]   = useState(false);
  const [lottieOn, setLottieOn]   = useState(false);
  const titleRef    = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const audioRef    = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/hooting.mpeg");
    audioRef.current.preload = "auto";
  }, []);

  const handleRevealed = useCallback(() => {
    setRevealed(true);
    setLottieOn(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleLottieDone = useCallback(() => {
    setLottieOn(false);
  }, []);

  return (
    <>
      <LottieConfettiOverlay active={lottieOn} onDone={handleLottieDone} />

      <section id="prizes" className="relative w-full py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 flex pointer-events-none">
          {[BLUE, YELLOW, GREEN, PINK].map((c, i) => (
            <div key={i} className="flex-1 opacity-[0.08]" style={{ background: c }} />
          ))}
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden" style={{ opacity: 0.017 }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 900,
            fontSize: "clamp(100px, 18vw, 240px)", color: "#2d2d2d", whiteSpace: "nowrap",
          }}>PRIZES</span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">

          {/* ── Title ── */}
          <div ref={titleRef} className="text-center mb-12">
            <motion.p
              className="text-[10px] uppercase tracking-[0.55em] mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#aaa" }}
              initial={{ opacity: 0, y: 10 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >Win Big</motion.p>

            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", lineHeight: 1.08 }}
              initial={{ opacity: 0, y: 28 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span style={{ color: "#2d2d2d" }}>Prize </span>
              <span style={{ color: "#5BA4E6" }}>Pool</span>
            </motion.h2>

            <motion.p
              className="mt-4 text-sm max-w-sm mx-auto"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#aaa" }}
              initial={{ opacity: 0 }}
              animate={titleInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              {revealed
                ? "The prize pool is out. Now go build and claim it."
                : "Scratch the card below to reveal what's waiting for you."}
            </motion.p>
          </div>

          {/* ── Scratch card ── */}
          <motion.div
            className="w-full mx-auto mb-12"
            style={{ maxWidth: 560 }}
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={titleInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                boxShadow: revealed
                  ? "0 0 0 3px rgba(200,154,42,0.35), 0 12px 36px rgba(200,154,42,0.2)"
                  : "0 0 0 1.5px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.5s",
              }}
            >
              <ScratchCard onRevealed={handleRevealed} />
            </div>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  className="flex justify-center mt-4"
                  initial={{ opacity: 0, y: 8, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <span
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold"
                    style={{
                      background: YELLOW,
                      color: "#78350f",
                      fontFamily: "'DM Sans', sans-serif",
                      border: "1.5px solid rgba(200,154,42,0.4)",
                      boxShadow: "0 4px 16px rgba(200,154,42,0.22)",
                    }}
                  >
                     You revealed it! Total prize pool is $4,00,000
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Separator ── */}
          <Separator label="Prize Breakdown" />

          {/* Desktop podium: 2nd | 1st | 3rd */}
          <div className="hidden sm:flex gap-4 items-end">
            <div className="flex-1"><PrizeCard prize={PRIZES[1]} sizeIndex={1} animIndex={1} /></div>
            <div className="flex-1" style={{ marginBottom: -14 }}><PrizeCard prize={PRIZES[0]} sizeIndex={0} animIndex={0} /></div>
            <div className="flex-1"><PrizeCard prize={PRIZES[2]} sizeIndex={2} animIndex={2} /></div>
          </div>

          {/* Mobile stacked: 1st > 2nd > 3rd */}
          <div className="flex sm:hidden flex-col gap-3">
            <PrizeCard prize={PRIZES[0]} sizeIndex={0} animIndex={0} />
            <PrizeCard prize={PRIZES[1]} sizeIndex={1} animIndex={1} />
            <PrizeCard prize={PRIZES[2]} sizeIndex={2} animIndex={2} />
          </div>

          <motion.p
            className="text-center text-[10px] uppercase tracking-[0.42em] mt-6"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#ccc" }}
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            Winners announced on event day
          </motion.p>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        `}</style>
      </section>
    </>
  );
}