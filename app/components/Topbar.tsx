"use client";
import React from "react";

export default function Topbar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-[#1a1a1a] bg-[#0b0b0b]/90 backdrop-blur-md z-40">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo K dorada */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl grid place-items-center bg-[#111111] border border-[#1a1a1a]">
            <span className="font-[Playfair Display] text-lg text-[#c4a15a]">K</span>
          </div>
          <div className="text-sm text-[#a8a8a8] tracking-wide">KikeHQ • Centro de mando</div>
        </div>
        {/* Botón menú */}
        <button
          onClick={onOpen}
          className="text-white/80 hover:text-white transition"
          aria-label="Abrir menú"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
