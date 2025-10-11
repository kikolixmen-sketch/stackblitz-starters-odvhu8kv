"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function Sidebar({
  abierto,
  onClose,
  onSelect,
}: {
  abierto: boolean;
  onClose: () => void;
  onSelect: (key: SectionKey) => void;
}) {
  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 left-0 h-full w-[300px] bg-[#111111] border-r border-[#1a1a1a] z-50"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="h-16 px-4 border-b border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl grid place-items-center bg-[#0b0b0b] border border-[#1a1a1a]">
                  <span className="font-[Playfair Display] text-lg text-[#c4a15a]">K</span>
                </div>
                <span className="text-sm text-[#a8a8a8]">Navegación</span>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition" aria-label="Cerrar menú">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <nav className="p-3">
              <MenuItem label="Panel" onClick={() => { onSelect("panel"); onClose(); }} />
              <MenuItem label="Personal" onClick={() => { onSelect("personal"); onClose(); }} />
              <MenuItem label="Agencia (Outreach)" onClick={() => { onSelect("agencia"); onClose(); }} />
              {/* Lecturas va como módulo lateral aparte, no tab */}
              <MenuItem label="Progreso" onClick={() => { onSelect("progreso"); onClose(); }} />
              <MenuItem label="Ajustes" onClick={() => { onSelect("ajustes"); onClose(); }} />
              <div className="mt-6 p-3 rounded-xl border border-[#1a1a1a] text-[#a8a8a8] text-xs">
                Próximamente: Lecturas lateral, Timeline horizontal, IA “Ask HQ”.
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

type SectionKey = "panel" | "personal" | "agencia" | "progreso" | "ajustes";

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/5 border border-transparent hover:border-[#1a1a1a] transition"
    >
      {label}
    </button>
  );
}
