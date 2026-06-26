"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MemberView } from "@/app/api/staff/participants/route";
import { BRAND_GRADIENT, CARD, FIELD, FONT_BODY, FONT_DISPLAY, GHOST_BTN, SEMANTIC, cx } from "@/components/staff/theme";

/**
 * Admin override editor. These values are a PORTAL-LOCAL overlay — they are never
 * written back to the check-in agent's data. Leaving a field blank clears that
 * part of the override and falls back to the original check-in value.
 */
export default function EditParticipantOverlay({
  member,
  currentTeamId,
  currentTeamName,
  onClose,
  onSaved,
}: {
  member: MemberView;
  currentTeamId: string;
  currentTeamName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(member.overridden ? member.participant_name : "");
  const [teamId, setTeamId] = useState(currentTeamId !== member.raw_team_id ? currentTeamId : "");
  const [teamName, setTeamName] = useState(currentTeamName !== member.raw_team_name ? currentTeamName : "");
  const [notes, setNotes] = useState(member.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/staff/participants/override", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          participant_code: member.participant_code,
          name,
          team_id: teamId,
          team_name: teamName,
          notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to save");
        return;
      }
      onSaved();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const label = "text-xs font-medium text-[#999]";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className={cx(CARD, "w-full max-w-md p-6")}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: FONT_DISPLAY }}>
            Edit participant
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#999]" style={{ fontFamily: FONT_BODY }}>
            Admin override (portal-only). Blank = keep the original check-in value. Original:{" "}
            <span className="font-semibold text-[#666]">{member.raw_participant_name}</span>, team{" "}
            <span className="font-semibold text-[#666]">{member.raw_team_name}</span> ({member.raw_team_id}).
          </p>

          <div className="mt-4 space-y-3" style={{ fontFamily: FONT_BODY }}>
            <div>
              <label className={label}>Participant name</label>
              <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} placeholder={member.raw_participant_name} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Team ID</label>
                <input className={FIELD} value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder={member.raw_team_id} />
              </div>
              <div>
                <label className={label}>Team name</label>
                <input className={FIELD} value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={member.raw_team_name} />
              </div>
            </div>
            <div>
              <label className={label}>Notes</label>
              <textarea className={FIELD} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <p className="text-[11px] text-[#aaa]">
              Changing Team ID moves this participant for elimination + meal grouping inside the portal only.
            </p>
          </div>

          {error ? <p className="mt-3 text-sm font-medium" style={{ color: SEMANTIC.danger }}>{error}</p> : null}

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onClose} disabled={saving} className={GHOST_BTN}>
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
              style={{ background: BRAND_GRADIENT }}
            >
              {saving ? "Saving…" : "Save override"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
