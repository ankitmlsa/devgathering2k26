"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_GRADIENT, CARD, FONT_BODY, FONT_DISPLAY, GHOST_BTN, SEMANTIC, cx } from "@/components/staff/theme";

/**
 * Reusable styled confirmation modal — replaces browser confirm()/alert().
 * Optional `children` render extra content (e.g. a note field) above the actions.
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  error,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !loading && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={cx(CARD, "w-full max-w-sm p-6")}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: FONT_DISPLAY }}>
              {title}
            </h2>
            {message ? (
              <p className="mt-2 text-sm leading-relaxed text-[#666]" style={{ fontFamily: FONT_BODY }}>
                {message}
              </p>
            ) : null}
            {children ? <div className="mt-4">{children}</div> : null}
            {error ? <p className="mt-3 text-sm font-medium" style={{ color: SEMANTIC.danger }}>{error}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={onClose} disabled={loading} className={GHOST_BTN}>
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                style={{ background: danger ? `linear-gradient(135deg, ${SEMANTIC.danger}, #c23a55)` : BRAND_GRADIENT }}
              >
                {loading ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
