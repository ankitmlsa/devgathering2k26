"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  Link,
  Banknote,
  Leaf,
  Bot,
  Lightbulb,
  Nfc,
  ShieldCheck,
  Trophy,
  Zap,
} from "lucide-react";

/* ── Palette ── */
const BLUE = "#CFE8FF";
const YELLOW = "#FFE9A8";
const GREEN = "#D7F5D0";
const PINK = "#FFD6E8";

/* ── 8 Tracks ── */
const TRACKS = [
  {
    id: 0,
    number: 1,
    name: "HealthCare",
    Icon: HeartPulse,
    accent: "#5BA4E6",
    bg: BLUE,
    desc: "Technology solutions improving healthcare access, diagnosis, and care.",
  },
  {
    id: 1,
    number: 2,
    name: "Blockchain",
    Icon: Link,
    accent: "#E8916E",
    bg: YELLOW,
    desc: "Build decentralized applications for security, transparency, and trust.",
  },
  {
    id: 2,
    number: 3,
    name: "FinTech",
    Icon: Banknote,
    accent: "#4CAF50",
    bg: GREEN,
    desc: "Innovate digital payments, banking, and financial services.",
  },
  {
    id: 3,
    number: 4,
    name: "Sustainability",
    Icon: Leaf,
    accent: "#D85C8A",
    bg: PINK,
    desc: "Develop solutions for climate action, renewable energy, waste management, and environmental protection.",
  },
  {
    id: 4,
    number: 5,
    name: "AI & ML",
    Icon: Bot,
    accent: "#5BA4E6",
    bg: BLUE,
    desc: "Use Artificial Intelligence and Machine Learning to solve real-world problems.",
  },
  {
    id: 5,
    number: 6,
    name: "Open Innovation",
    Icon: Lightbulb,
    accent: "#E8916E",
    bg: YELLOW,
    desc: "Any creative idea solving real-world challenges.",
  },
  {
    id: 6,
    number: 7,
    name: "IoT & Smart Systems",
    Icon: Nfc,
    accent: "#4CAF50",
    bg: GREEN,
    desc: "Connected devices and sensors enabling smarter environments.",
  },
  {
    id: 7,
    number: 8,
    name: "Cyber Security",
    Icon: ShieldCheck,
    accent: "#D85C8A",
    bg: PINK,
    desc: "Create tools protecting systems, data, and privacy.",
  },
];

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function getPolarPosition(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

/* ══════════════════════════════════════════════════════
   BULB SVG
══════════════════════════════════════════════════════ */
function Bulb({ on }: { on: boolean }) {
  return (
    <svg
      width="100"
      height="134"
      viewBox="0 0 90 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="45"
        y1="0"
        x2="45"
        y2="18"
        stroke="#d1d5db"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {on && (
        <>
          <ellipse
            cx="45"
            cy="62"
            rx="38"
            ry="38"
            fill="#fbbf24"
            opacity="0.12"
          />
          <ellipse
            cx="45"
            cy="62"
            rx="28"
            ry="28"
            fill="#fbbf24"
            opacity="0.18"
          />
        </>
      )}
      <path
        d="M20 55 Q18 36 45 24 Q72 36 70 55 Q70 72 58 80 L58 88 Q58 92 54 92 L36 92 Q32 92 32 88 L32 80 Q20 72 20 55 Z"
        fill={on ? "url(#bulbLitGrad)" : "url(#bulbDimGrad)"}
        stroke={on ? "#f59e0b" : "#d1d5db"}
        strokeWidth="1.5"
      />
      <path
        d="M38 78 Q38 70 42 65 Q45 60 48 65 Q52 70 52 78"
        fill="none"
        stroke={on ? "#f59e0b" : "#9ca3af"}
        strokeWidth={on ? "2" : "1.5"}
        strokeLinecap="round"
      />
      <rect
        x="32"
        y="88"
        width="26"
        height="5"
        rx="2"
        fill={on ? "#fbbf24" : "#d1d5db"}
      />
      <rect
        x="34"
        y="93"
        width="22"
        height="5"
        rx="2"
        fill={on ? "#f59e0b" : "#9ca3af"}
      />
      <rect
        x="36"
        y="98"
        width="18"
        height="5"
        rx="2"
        fill={on ? "#f59e0b" : "#6b7280"}
      />
      {on && (
        <ellipse
          cx="36"
          cy="42"
          rx="5"
          ry="8"
          fill="rgba(255,255,255,0.35)"
          transform="rotate(-20 36 42)"
        />
      )}
      <defs>
        <radialGradient id="bulbLitGrad" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id="bulbDimGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#d1d5db" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   TRACK CARD (desktop orbital)
══════════════════════════════════════════════════════ */
function TrackCard({
  track,
  angle,
  radius,
  revealed,
  delay,
}: {
  track: (typeof TRACKS)[0];
  angle: number;
  radius: number;
  revealed: boolean;
  delay: number;
}) {
  const { x, y } = getPolarPosition(angle, radius);
  const CARD_W = 176;
  const CARD_H = 196;
  const { Icon } = track;

  return (
    <motion.div
      className="absolute flex flex-col overflow-hidden rounded-2xl cursor-default"
      style={{
        width: CARD_W,
        height: CARD_H,
        left: `calc(50% + ${x}px - ${CARD_W / 2}px)`,
        top: `calc(50% + ${y}px - ${CARD_H / 2}px)`,
        background: revealed ? track.bg : "#f0f0f0",
        outline: `1.5px solid ${revealed ? track.accent + "45" : "rgba(0,0,0,0.08)"}`,
        outlineOffset: 0,
        boxShadow: revealed
          ? `0 0 0 4px ${track.accent}10, 0 8px 28px ${track.accent}28, inset 0 1px 0 rgba(255,255,255,0.85)`
          : "0 2px 10px rgba(0,0,0,0.06)",
        transition: "background 0.4s, outline 0.4s, box-shadow 0.4s",
        zIndex: 10,
      }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={
        revealed
          ? { scale: 1, opacity: 1, y: 0 }
          : { scale: 0.88, opacity: 0.55, y: 0 }
      }
      transition={{
        duration: 0.55,
        delay: revealed ? delay : delay * 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={revealed ? { scale: 1.06, zIndex: 20 } : {}}
    >
      {revealed && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(140deg, rgba(255,255,255,0.55) 0%, transparent 52%)",
              borderRadius: "inherit",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${track.accent}28 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
              opacity: 0.45,
              borderRadius: "inherit",
            }}
          />
        </>
      )}

      <motion.div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: revealed
            ? `linear-gradient(90deg, transparent, ${track.accent}bb 35%, ${track.accent} 50%, ${track.accent}bb 65%, transparent)`
            : "transparent",
          borderRadius: "16px 16px 0 0",
          transition: "background 0.4s",
        }}
        animate={
          revealed ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
        }
        transition={{ duration: 0.5, delay: revealed ? delay + 0.15 : 0 }}
      />

      {revealed && (
        <div
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full opacity-50"
          style={{ background: track.accent }}
        />
      )}

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 900,
          fontSize: 72,
          color: revealed ? track.accent : "#bbb",
          opacity: revealed ? 0.1 : 0.25,
          transition: "color 0.4s, opacity 0.4s",
          letterSpacing: "-0.04em",
        }}
      >
        {track.number}
      </div>

      <AnimatePresence>
        {!revealed && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 38,
                height: 38,
                background: "rgba(0,0,0,0.05)",
                border: "1.5px solid rgba(0,0,0,0.1)",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#bbb"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </motion.div>
            <p
              className="text-[9px] uppercase tracking-[0.35em] font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#bbb" }}
            >
              Track {track.number}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            className="relative z-10 flex flex-col gap-2 p-3.5 pt-5 h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, delay: delay + 0.2 }}
          >
            <motion.div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 46,
                height: 46,
                background: "white",
                border: `1.5px solid ${track.accent}28`,
                boxShadow: `0 0 0 3px ${track.accent}14`,
                alignSelf: "flex-start",
                flexShrink: 0,
              }}
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.4,
                delay: delay + 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Icon size={22} color={track.accent} strokeWidth={1.8} />
            </motion.div>

            <p
              className="font-black leading-tight tracking-tight text-sm"
              style={{ fontFamily: "'Syne', sans-serif", color: "#1a1a1a" }}
            >
              {track.name}
            </p>

            <p
              className="text-[10px] leading-snug flex-1"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#666" }}
            >
              {track.desc}
            </p>

            <span
              className="inline-flex items-center gap-1 self-start text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: `${track.accent}1c`,
                border: `1px solid ${track.accent}45`,
                color: track.accent,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Track {track.number}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   CONNECTOR LINES
══════════════════════════════════════════════════════ */
function ConnectorLines({
  on,
  radius,
  orbitSize,
}: {
  on: boolean;
  radius: number;
  orbitSize: number;
}) {
  const CARD_W = 176;
  const CARD_H = 196;
  const C = orbitSize / 2;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", zIndex: 1 }}
      viewBox={`0 0 ${orbitSize} ${orbitSize}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {ANGLES.map((angle, i) => {
        const { x: cx, y: cy } = getPolarPosition(angle, radius);
        const cardCX = C + cx;
        const cardCY = C + cy;
        const len = Math.sqrt(cx * cx + cy * cy);
        const nx = cx / len;
        const ny = cy / len;
        const hw = CARD_W / 2;
        const hh = CARD_H / 2;
        let tEnter = -Infinity;
        let tExit = Infinity;

        if (Math.abs(nx) > 1e-9) {
          const t1 = (cardCX - hw - C) / nx;
          const t2 = (cardCX + hw - C) / nx;
          tEnter = Math.max(tEnter, Math.min(t1, t2));
          tExit = Math.min(tExit, Math.max(t1, t2));
        }
        if (Math.abs(ny) > 1e-9) {
          const t1 = (cardCY - hh - C) / ny;
          const t2 = (cardCY + hh - C) / ny;
          tEnter = Math.max(tEnter, Math.min(t1, t2));
          tExit = Math.min(tExit, Math.max(t1, t2));
        }

        const tEdge =
          tEnter > 0 && tEnter <= tExit ? tEnter : Math.max(0, tExit);
        const EXTRA = 110;
        const ex = C + (tEdge + EXTRA) * nx;
        const ey = C + (tEdge + EXTRA) * ny;
        const startX = C;
        const startY = C;

        return (
          <motion.line
            key={i}
            x1={startX}
            y1={startY}
            x2={ex}
            y2={ey}
            stroke={on ? TRACKS[i].accent : "rgba(0,0,0,0.1)"}
            strokeWidth={on ? 1.8 : 1}
            strokeDasharray="6 5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              on
                ? { pathLength: 1, opacity: 0.65 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              duration: 0.5,
              delay: on ? i * 0.07 : 0,
              ease: "easeOut",
            }}
          />
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MOBILE GRID
══════════════════════════════════════════════════════ */
function MobileGrid({ revealedCount }: { revealedCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full px-2 md:hidden">
      {TRACKS.map((track, i) => {
        const revealed = i < revealedCount;
        const { Icon } = track;
        return (
          <motion.div
            key={track.id}
            className="relative flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: revealed ? track.bg : "#f0f0f0",
              outline: `1.5px solid ${revealed ? track.accent + "45" : "rgba(0,0,0,0.08)"}`,
              boxShadow: revealed
                ? `0 0 0 4px ${track.accent}10, 0 8px 28px ${track.accent}28, inset 0 1px 0 rgba(255,255,255,0.85)`
                : "0 2px 10px rgba(0,0,0,0.06)",
              minHeight: 170,
              transition: "background 0.4s, outline 0.4s, box-shadow 0.4s",
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={
              revealed
                ? { scale: 1, opacity: 1 }
                : { scale: 0.88, opacity: 0.55 }
            }
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {revealed && (
              <>
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${track.accent}bb 35%, ${track.accent} 50%, ${track.accent}bb 65%, transparent)`,
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(${track.accent}28 1px, transparent 1px)`,
                    backgroundSize: "12px 12px",
                    opacity: 0.45,
                    borderRadius: "inherit",
                  }}
                />
              </>
            )}

            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 900,
                fontSize: 72,
                color: revealed ? track.accent : "#bbb",
                opacity: revealed ? 0.1 : 0.25,
                transition: "color 0.4s",
              }}
            >
              {track.number}
            </div>

            <AnimatePresence>
              {!revealed && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 38,
                      height: 38,
                      background: "rgba(0,0,0,0.05)",
                      border: "1.5px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#bbb"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <p
                    className="text-[9px] uppercase tracking-[0.35em] font-semibold"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#bbb",
                    }}
                  >
                    Track {track.number}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  className="relative z-10 flex flex-col gap-2 p-3 pt-4 h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: 46,
                      height: 46,
                      background: "white",
                      border: `1.5px solid ${track.accent}28`,
                      boxShadow: `0 0 0 3px ${track.accent}14`,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Icon size={22} color={track.accent} strokeWidth={1.8} />
                  </div>
                  <p
                    className="font-black leading-tight tracking-tight text-sm"
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      color: "#1a1a1a",
                    }}
                  >
                    {track.name}
                  </p>
                  <p
                    className="text-[10px] leading-snug flex-1"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#666",
                    }}
                  >
                    {track.desc}
                  </p>
                  <span
                    className="inline-flex items-center self-start text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: `${track.accent}1c`,
                      border: `1px solid ${track.accent}45`,
                      color: track.accent,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Track {track.number}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ASI ONE — SPECIAL TRACK CARD
══════════════════════════════════════════════════════ */
function ASIOneCard({ revealed }: { revealed: boolean }) {
  // Blend of all palette colors for ASI One
  const asiAccent = "#7C6FE0"; // rich purple-indigo — distinct, premium
  const asiBg =
    "linear-gradient(135deg, #EDE9FF 0%, #CFE8FF 40%, #FFE9A8 75%, #D7F5D0 100%)";

  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto mt-16 overflow-hidden rounded-3xl cursor-default"
      style={{
        background: revealed ? "white" : "#f0f0f0",
        border: revealed
          ? `2px solid ${asiAccent}30`
          : "2px solid rgba(0,0,0,0.07)",
        boxShadow: revealed
          ? `0 0 0 6px ${asiAccent}0a, 0 24px 60px ${asiAccent}22, inset 0 1px 0 rgba(255,255,255,0.9)`
          : "0 4px 16px rgba(0,0,0,0.06)",
        transition: "background 0.5s, border 0.5s, box-shadow 0.5s",
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={revealed ? { scale: 1.012 } : {}}
    >
      {/* Animated gradient background when revealed */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: "inherit" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Pastel gradient wash — uses all 4 palette colors */}
            <div
              className="absolute inset-0"
              style={{
                background: asiBg,
                opacity: 0.38,
                borderRadius: "inherit",
              }}
            />
            {/* Dot grid texture */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(${asiAccent}20 1.2px, transparent 1.2px)`,
                backgroundSize: "14px 14px",
                opacity: 0.5,
                borderRadius: "inherit",
              }}
            />
            {/* Shimmer top bar */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[4px]"
              style={{
                background: `linear-gradient(90deg, #CFE8FF, ${asiAccent}, #FFE9A8, #D7F5D0, ${asiAccent}, #FFD6E8)`,
                backgroundSize: "300% 100%",
                borderRadius: "24px 24px 0 0",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            {/* Glass glare */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(130deg, rgba(255,255,255,0.6) 0%, transparent 45%)",
                borderRadius: "inherit",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOCKED STATE */}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center py-14 gap-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: "rgba(0,0,0,0.04)",
                border: "1.5px solid rgba(0,0,0,0.09)",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </motion.div>
            <div className="text-center">
              <p
                className="text-[11px] uppercase tracking-[0.55em] font-bold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "#ccc" }}
              >
                Special Track
              </p>
              <p
                className="text-xl font-black mt-1"
                style={{ fontFamily: "'Syne', sans-serif", color: "#e0e0e0" }}
              >
                ASI One
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVEALED STATE */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 p-7 md:p-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            {/* Left — Icon + badges */}
            <div className="flex flex-col items-start gap-4 flex-shrink-0">
              {/* ASI One official logo */}
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2219 512"
                  style={{ width: 140, height: "auto", color: asiAccent }}
                >
                  <path
                    fill="currentColor"
                    d="M724.5 126.7L633.2 380.2h34l26.9-75.7H813.3l27.8 75.7h35.1L782.2 126.7H724.5zM705 274l41.5-116.7h12.6L802.1 274H705zm363.3-25.9c-12.6-5.9-27.6-9.5-45-10.9l-28.1-2.4c-14.1-1.2-24.8-5.3-31.9-12.5s-10.8-15.4-10.8-24.7c0-8.1 2-15.7 6.1-22.7s10.2-12.8 18.4-17.2s18.6-6.6 31.1-6.6c13 0 23.5 2.3 31.6 6.9c8.1 4.6 14.1 10.5 17.9 17.7s5.7 14.8 5.7 22.9h34c0-16.2-3.8-30.2-11.3-41.8c-7.5-11.7-18-20.8-31.4-27.3s-28.9-9.7-46.5-9.7c-17.8 0-33.5 3.3-46.9 9.9s-23.9 15.7-31.4 27.3s-11.3 25.1-11.3 40.6c0 19.7 6.7 35.5 20.1 47.6s31.4 19 53.8 20.8l28.1 2.4c17.4 1.6 30.6 5.9 39.6 12.7s13.5 15.5 13.5 25.9c0 8.6-2.3 16.5-6.9 23.8s-11.8 13.2-21.5 17.7s-22.2 6.8-37.5 6.8c-16.4 0-29.5-2.5-39.1-7.6s-16.4-11.5-20.5-19.1c-4.1-7.6-6.1-15.3-6.1-22.9h-34c0 15.5 3.9 29.4 11.8 41.7c7.9 12.3 19.2 21.9 34 28.8s32.8 10.4 53.8 10.4c19.9 0 37.4-3.4 52.4-10.1s26.7-16.1 35.1-28.1s12.5-25.8 12.5-41.3c0-13.7-3.4-25.4-10.2-35.2s-16.6-17.7-29.2-23.6zm131.1-121.4h-34V380.2h34V126.7zm124.7 40h-40.3v42.4h40.3V166.7zm0 128.5h-40.3v42.4h40.3V295.2zm196.4 91.2c-21.9 0-41.4-3.8-57.8-11.2c-16.5-7.5-30.6-17.5-41.9-29.7c-11.3-12.3-20-26.2-25.7-41.4c-5.8-15.2-8.7-31-8.7-46.8v-8.9c0-15.8 3-31.7 8.9-47.1c5.9-15.3 14.7-29.3 26.2-41.6c11.4-12.2 25.6-22.1 42.1-29.5c16.5-7.3 35.6-11 56.8-11s40.4 3.7 56.8 11c16.5 7.3 30.6 17.2 42.1 29.5c11.5 12.3 20.3 26.3 26.2 41.6c5.9 15.4 8.9 31.2 8.9 47.1v8.9c0 15.9-2.9 31.6-8.7 46.8c-5.7 15.2-14.4 29.1-25.7 41.4c-11.3 12.2-25.4 22.2-41.9 29.7c-16.4 7.4-35.9 11.2-57.8 11.2zm0-239c-20.4 0-38.4 4.7-53.6 13.9c-15.3 9.2-27.1 22-35.3 37.9c-8.1 15.8-12.1 33.8-12.1 53.7c0 19.5 4 37.3 11.9 53.1c8 15.9 19.7 28.8 34.7 38.2s33.4 14.2 54.4 14.2c21 0 39.3-4.8 54.4-14.2s26.8-22.3 34.7-38.2c7.9-15.8 11.9-33.6 11.9-53.1c0-19.8-4.1-37.9-12.1-53.7c-8.2-15.9-19.9-28.7-35-37.9c-15.1-9.2-33.2-13.9-53.9-13.9zm371.7 232.5V224.5c0-22.5-6.6-40.9-19.5-54.7c-13-14-31-21.1-53.3-21.1c-22.9 0-41.8 7.3-56.1 21.6s-21.6 33.6-21.6 57.2V379.9h-33.5V127.2h33.9v55.5s5.9-16.6 19.7-32c14.6-16.3 38-31.5 70.2-31.5h2c31.6 0 54.9 13.4 69.8 32.7c15.1 19.6 22 44.7 22 82.6V379.9h-33.5zm210.6 6.6c-56.8 0-124.8-37.7-124.8-138c0-53.7 34-129.2 121.8-129.2c81.1 0 118.9 60.5 118.9 121.3v15H2011l.4 6.4c.9 16 3.9 30.6 9.1 43.4c6.5 15.9 16.7 28.7 30.4 38c13.7 9.3 31.2 14 52 14c21.8 0 39.9-5 53.7-14.8c12.3-8.7 20.4-18.9 24.3-30.3l.1-.4h31.8l-.2 .8c-3.8 13.6-9.9 25.6-18.4 35.8c-10.1 12.2-23 21.7-38.3 28.2c-15.5 6.5-33.4 9.8-53 9.8zm-2.9-238.2c-58.7 0-83.1 44.6-87.9 84.2h174.2c-1.7-40.6-27.5-84.2-86.3-84.2zM.2 168.8H168.9V337.5H.2V168.8zM422.1 337.5a84.4 84.4 0 1 0 0-168.8 84.4 84.4 0 1 0 0 168.8zm-84.4 0H168.9V506.3H337.7V337.5zM337.7 0H168.9V168.8H337.7V0z"
                  />
                </svg>
              </motion.div>

              {/* Special Winner badge */}
              <motion.div
                className="flex flex-col gap-1.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                  style={{
                    background: `linear-gradient(135deg, ${asiAccent}18, ${asiAccent}28)`,
                    border: `1.5px solid ${asiAccent}40`,
                    color: asiAccent,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Trophy size={9} strokeWidth={2.5} />
                  Separate Winner
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                  style={{
                    background: "linear-gradient(135deg, #FFE9A820, #FFE9A840)",
                    border: "1.5px solid #C89A2A40",
                    color: "#C89A2A",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Zap size={9} strokeWidth={2.5} />
                  Special Track
                </span>
              </motion.div>
            </div>

            {/* Right — Text content */}
            <div className="flex flex-col gap-3 flex-1">
              {/* Label */}
              <motion.p
                className="text-[9px] uppercase tracking-[0.6em] font-semibold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: asiAccent + "99",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Special Theme · Track S
              </motion.p>

              {/* Title */}
              <motion.h3
                className="text-3xl md:text-4xl font-black tracking-tight leading-none"
                style={{ fontFamily: "'Syne', sans-serif", color: "#18181b" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                ASI{" "}
                <span
                  style={{
                    background: `linear-gradient(120deg, ${asiAccent}, #5BA4E6, #C89A2A)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  One
                </span>
              </motion.h3>

              {/* Divider */}
              <motion.div
                style={{
                  height: 1.5,
                  background: `linear-gradient(90deg, ${asiAccent}40, #5BA4E640, #C89A2A30, transparent)`,
                  borderRadius: 2,
                }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              />

              {/* Description */}
              <motion.p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "#555" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Most AI applications stop at conversation. Your challenge is to
                build an AI agent that can be discovered through ASI:One,
                understand a user’s intent, and take meaningful action to solve
                a real-world problem. Your agent might coordinate services,
                automate a workflow, analyze live information, make
                recommendations, complete transactions, or collaborate with
                other specialized agents. The problem and approach are up to
                you, but the result should be more than a chatbot or a thin
                wrapper around an API.
              </motion.p>

              {/* Info pills row */}
              <motion.div
                className="flex flex-wrap gap-2 mt-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58 }}
              >
                {[
                  {
                    label: "Exclusive Winner Prize",
                    color: BLUE,
                    text: "#5BA4E6",
                  },
                  {
                    label: "Independent Judging Panel",
                    color: GREEN,
                    text: "#4CAF50",
                  },
                  {
                    label: "Open to all participants",
                    color: YELLOW,
                    text: "#C89A2A",
                  },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: pill.color + "55",
                      border: `1px solid ${pill.text}30`,
                      color: pill.text,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {pill.label}
                  </span>
                ))}
              </motion.div>

              {/* Bottom notice */}
              <motion.div
                className="mt-2 p-3 rounded-xl flex items-start gap-2.5"
                style={{
                  background: `${asiAccent}09`,
                  border: `1px solid ${asiAccent}20`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                <Trophy
                  size={13}
                  color={asiAccent}
                  strokeWidth={2}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#666" }}
                >
                  A{" "}
                  <span style={{ fontWeight: 700, color: "#18181b" }}>
                    dedicated winner
                  </span>{" "}
                  will be announced separately for this track — independent of
                  the main hackathon winners. Teams can participate in ASI One
                  alongside any other track.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner watermark — always visible */}
      <div
        className="absolute bottom-3 right-5 pointer-events-none select-none"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 900,
          fontSize: 52,
          color: revealed ? asiAccent : "#ddd",
          opacity: revealed ? 0.07 : 0.2,
          letterSpacing: "-0.04em",
          transition: "color 0.5s, opacity 0.5s",
          lineHeight: 1,
        }}
      >
        S
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   THEMES SECTION
══════════════════════════════════════════════════════ */
export default function ThemesSection() {
  const [revealedCount, setRevealedCount] = useState(0);
  const [on, setOn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const RADIUS_DESKTOP = 620;
  const ORBIT_SIZE = RADIUS_DESKTOP * 2 + 240;

  // ASI One reveals after all 8 tracks (delay = 8 * 500ms + 400ms extra)
  const asiRevealed = on && revealedCount >= TRACKS.length;

  useEffect(() => {
    audioRef.current = new Audio("./click.mpeg");
    audioRef.current.preload = "auto";
  }, []);

  const playClick = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    playClick();

    if (timerRef.current) clearInterval(timerRef.current);

    if (!on) {
      setOn(true);
      setRevealedCount(0);
      let count = 0;
      timerRef.current = setInterval(() => {
        count += 1;
        setRevealedCount(count);
        if (count >= TRACKS.length) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
        }
      }, 500);
    } else {
      setOn(false);
      let count = TRACKS.length;
      timerRef.current = setInterval(() => {
        count -= 1;
        setRevealedCount(count);
        if (count <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setRevealedCount(0);
        }
      }, 500);
    }
  }, [on, playClick]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const isAnimating = timerRef.current !== null;

  return (
    <section id="themes" className="relative w-full py-20 px-4 overflow-hidden">
      {/* 4-band pastel wash */}
      <div className="absolute inset-0 flex pointer-events-none">
        {[BLUE, YELLOW, GREEN, PINK].map((c, i) => (
          <div
            key={i}
            className="flex-1 opacity-[0.08]"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* Ghost watermark */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden"
        style={{ opacity: 0.018 }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(100px, 20vw, 180px)",
            color: "#2d2d2d",
            whiteSpace: "nowrap",
          }}
        >
          THEMES
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── Title ── */}
        <div className="text-center mb-10">
          <motion.p
            className="text-[10px] uppercase tracking-[0.55em] mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#aaa" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Pick Your Track
          </motion.p>

          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif", lineHeight: 1.08 }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{ color: "#2d2d2d" }}>Hackathon </span>
            <span style={{ color: "#5BA4E6" }}>Themes</span>
          </motion.h2>

          <motion.div
            className="mx-auto mt-4 rounded-full"
            style={{
              height: 3,
              background:
                "linear-gradient(90deg, #CFE8FF, #FFE9A8, #D7F5D0, #FFD6E8)",
            }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          <motion.p
            className="mt-4 text-sm max-w-sm mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#aaa" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {on
              ? revealedCount < TRACKS.length
                ? `Revealing track ${revealedCount + 1} of ${TRACKS.length}…`
                : "The tracks are live — choose your battlefield."
              : isAnimating
                ? "Powering down…"
                : "Hit the switch to reveal all 8 tracks."}
          </motion.p>
        </div>

        {/* ── Toggle ── */}
        <motion.div
          className="flex flex-col items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p
            className="text-[9px] uppercase tracking-[0.45em]"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#bbb" }}
          >
            {on ? "Click to turn off" : "Click to illuminate"}
          </p>

          <motion.button
            onClick={toggle}
            disabled={isAnimating}
            className="relative flex items-center rounded-full cursor-pointer border-none"
            style={{
              width: 80,
              height: 40,
              background: on
                ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                : "rgba(0,0,0,0.1)",
              padding: 4,
              boxShadow: on
                ? "0 0 0 4px rgba(251,191,36,0.2), 0 4px 18px rgba(251,191,36,0.45)"
                : "0 2px 8px rgba(0,0,0,0.1)",
              transition: "background 0.4s, box-shadow 0.4s",
              opacity: isAnimating ? 0.7 : 1,
            }}
            whileHover={!isAnimating ? { scale: 1.06 } : {}}
            whileTap={!isAnimating ? { scale: 0.95 } : {}}
          >
            <motion.div
              className="rounded-full bg-white"
              style={{
                width: 32,
                height: 32,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              animate={{ x: on ? 40 : 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute text-[9px] font-black uppercase tracking-widest"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: on ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.3)",
                left: on ? 10 : "auto",
                right: on ? "auto" : 10,
                transition: "color 0.3s",
              }}
            >
              {on ? "ON" : "OFF"}
            </motion.span>
          </motion.button>
        </motion.div>

        {/* ── MOBILE grid ── */}
        <MobileGrid revealedCount={revealedCount} />

        {/* ── DESKTOP orbit ── */}
        <div className="hidden md:flex flex-col items-center">
          <div
            className="relative"
            style={{
              width: ORBIT_SIZE,
              height: ORBIT_SIZE,
              maxWidth: "min(100vw - 48px, 1000px)",
              maxHeight: "min(100vw - 48px, 1000px)",
            }}
          >
            <AnimatePresence>
              {on && (
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: "45%",
                    height: "45%",
                    top: "27.5%",
                    left: "27.5%",
                    background:
                      "radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(245,158,11,0.08) 50%, transparent 70%)",
                    filter: "blur(32px)",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.7 }}
                />
              )}
            </AnimatePresence>

            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${((RADIUS_DESKTOP * 2) / ORBIT_SIZE) * 100}%`,
                height: `${((RADIUS_DESKTOP * 2) / ORBIT_SIZE) * 100}%`,
                top: `${((ORBIT_SIZE / 2 - RADIUS_DESKTOP) / ORBIT_SIZE) * 100}%`,
                left: `${((ORBIT_SIZE / 2 - RADIUS_DESKTOP) / ORBIT_SIZE) * 100}%`,
                border: on
                  ? "1.5px dashed rgba(251,191,36,0.3)"
                  : "1.5px dashed rgba(0,0,0,0.07)",
                transition: "border 0.5s",
              }}
            />

            <ConnectorLines
              on={on}
              radius={RADIUS_DESKTOP * 0.5}
              orbitSize={ORBIT_SIZE}
            />

            {TRACKS.map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                angle={ANGLES[i]}
                radius={RADIUS_DESKTOP * 0.5}
                revealed={i < revealedCount}
                delay={0}
              />
            ))}

            <div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -54%)",
                zIndex: 30,
              }}
            >
              <AnimatePresence>
                {on && (
                  <>
                    <motion.div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 120,
                        height: 120,
                        top: "50%",
                        left: "50%",
                        translateX: "-50%",
                        translateY: "-50%",
                        border: "1.5px solid rgba(251,191,36,0.4)",
                      }}
                      animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                    <motion.div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 120,
                        height: 120,
                        top: "50%",
                        left: "50%",
                        translateX: "-50%",
                        translateY: "-50%",
                        border: "1.5px solid rgba(251,191,36,0.25)",
                      }}
                      animate={{ scale: [1, 2], opacity: [0.35, 0] }}
                      transition={{
                        duration: 1.8,
                        delay: 0.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  </>
                )}
              </AnimatePresence>

              <motion.div
                animate={
                  on
                    ? {
                        filter:
                          "drop-shadow(0 0 24px rgba(251,191,36,0.7)) drop-shadow(0 0 8px rgba(245,158,11,0.5))",
                      }
                    : { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.12))" }
                }
                transition={{ duration: 0.5 }}
              >
                <Bulb on={on} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ASI ONE — SPECIAL TRACK (below orbit, always rendered)
        ══════════════════════════════════════════════════════ */}
        <div className="mt-6 md:mt-0 px-2 md:px-0">
          {/* Section label */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div
              className="h-px flex-1 max-w-[120px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,0,0,0.1))",
              }}
            />
            <div className="flex items-center gap-1.5">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: asiRevealed ? "#7C6FE0" : "#ccc",
                  transition: "background 0.4s",
                }}
              />
              <p
                className="text-[9px] uppercase tracking-[0.55em] font-bold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: asiRevealed ? "#7C6FE0" : "#ccc",
                  transition: "color 0.4s",
                }}
              >
                Special Track
              </p>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: asiRevealed ? "#7C6FE0" : "#ccc",
                  transition: "background 0.4s",
                }}
              />
            </div>
            <div
              className="h-px flex-1 max-w-[120px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.1), transparent)",
              }}
            />
          </motion.div>

          <ASIOneCard revealed={asiRevealed} />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </section>
  );
}
