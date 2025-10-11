"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useKikeStore } from "../store/useKikeStore";

type Props = { abierto: boolean; onClose: () => void };

const daysBetween = (start?: string, end?: string) => {
  if (!start || !end) return null;
  const s = new Date(start), e = new Date(end);
  const ms = e.getTime() - s.getTime();
  if (isNaN(ms)) return null;
  // +1 para contar ambos extremos (leer del 1 al 3 = 3 días)
  return Math.max(1, Math.ceil(ms / 86400000) + 1);
};

export default function LecturasDrawer({ abierto, onClose }: Props) {
  const { books, addBook, updateBook, removeBook } = useKikeStore();
  const [form, setForm] = useState({
    title: "", author: "", startDate: "", endDate: "", status: "en-curso" as const, notes: ""
  });

  const enCurso = useMemo(() => books.filter(b => b.status === "en-curso"), [books]);
  const completados = useMemo(() => books.filter(b => b.status === "completado"), [books]);

  const submit = () => {
    if (!form.title.trim()) return;
    addBook(form);
    setForm({ title: "", author: "", startDate: "", endDate: "", status: "en-curso", notes: "" });
  };

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 h-full w-[420px] bg-[#111111] border-l border-[#1a1a1a] z-50 overflow-y-auto"
            initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            {/* Header */}
            <div className="h-16 px-5 border-b border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl grid place-items-center bg-[#0b0b0b] border border-[#1a1a1a]">
                  <span className="font-[Playfair Display] text-lg text-[#c4a15a]">K</span>
                </div>
                <span className="text-sm text-[#a8a8a8]">Lecturas</span>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition" aria-label="Cerrar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Formulario añadir */}
            <div className="p-5 border-b border-[#1a1a1a]">
              <div className="text-sm mb-3 text-[#a8a8a8]">Añadir libro</div>
              <div className="space-y-3">
                <Input label="Título" value={form.title} onChange={v => setForm({ ...form, title: v })} />
                <Input label="Autor" value={form.author} onChange={v => setForm({ ...form, author: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Inicio" type="date" value={form.startDate} onChange={v => setForm({ ...form, startDate: v })} />
                  <Input label="Fin" type="date" value={form.endDate} onChange={v => setForm({ ...form, endDate: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Estado"
                    value={form.status}
                    onChange={v => setForm({ ...form, status: v as any })}
                    options={[
                      { value: "en-curso", label: "En curso" },
                      { value: "completado", label: "Completado" },
                    ]}
                  />
                  <div className="text-sm text-[#a8a8a8] flex items-end">
                    {daysBetween(form.startDate, form.endDate) !== null && (
                      <span>Días: <span className="text-white">{daysBetween(form.startDate, form.endDate)}</span></span>
                    )}
                  </div>
                </div>
                <Textarea label="Notas" value={form.notes} onChange={v => setForm({ ...form, notes: v })} rows={3} />
                <div className="flex justify-end">
                  <button onClick={submit} className="btn-gold">Añadir</button>
                </div>
              </div>
            </div>

            {/* En curso */}
            <Section title="En curso" emptyText="Aún no tienes libros en curso.">
              {enCurso.map(b => (
                <BookRow key={b.id} b={b} onUpdate={updateBook} onRemove={removeBook} />
              ))}
            </Section>

            {/* Completados */}
            <Section title="Completados" emptyText="Cuando cierres un libro aparecerá aquí.">
              {completados.map(b => (
                <BookRow key={b.id} b={b} onUpdate={updateBook} onRemove={removeBook} />
              ))}
            </Section>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children, emptyText }: any) {
  const has = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="p-5">
      <div className="text-sm mb-3 text-[#a8a8a8]">{title}</div>
      <div className="space-y-3">
        {has ? children : <div className="text-[#777] text-sm">{emptyText}</div>}
      </div>
    </div>
  );
}

function BookRow({
  b,
  onUpdate,
  onRemove,
}: {
  b: any;
  onUpdate: (id: string, patch: any) => void;
  onRemove: (id: string) => void;
}) {
  const dias = daysBetween(b.startDate, b.endDate);
  return (
    <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0f0f0f]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{b.title}</div>
          <div className="text-xs text-[#a8a8a8]">{b.author || "Autor desconocido"}</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-transparent border border-[#1a1a1a] rounded-lg px-2 py-1 text-sm"
            value={b.status}
            onChange={(e) => onUpdate(b.id, { status: e.target.value })}
          >
            <option value="en-curso">En curso</option>
            <option value="completado">Completado</option>
          </select>
          <button
            onClick={() => onRemove(b.id)}
            className="text-[#a8a8a8] hover:text-white transition"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
        <DateCell label="Inicio" value={b.startDate} onChange={(v) => onUpdate(b.id, { startDate: v })} />
        <DateCell label="Fin" value={b.endDate} onChange={(v) => onUpdate(b.id, { endDate: v })} />
        <div className="px-2 py-1 rounded-lg bg-[#111] border border-[#1a1a1a]">
          <div className="text-xs text-[#a8a8a8]">Días</div>
          <div className="">{dias ?? "-"}</div>
        </div>
        <div className="px-2 py-1 rounded-lg bg-[#111] border border-[#1a1a1a] col-span-2 md:col-span-1">
          <div className="text-xs text-[#a8a8a8]">Notas</div>
          <input
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Opcional"
            defaultValue={b.notes || ""}
            onBlur={(e) => onUpdate(b.id, { notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <label className="block">
      <div className="text-xs text-[#a8a8a8] mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-3 py-2 outline-none focus:border-[#c4a15a] transition"
      />
    </label>
  );
}
function Textarea({ label, value, onChange, rows = 3 }: any) {
  return (
    <label className="block">
      <div className="text-xs text-[#a8a8a8] mb-1">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-3 py-2 outline-none focus:border-[#c4a15a] transition resize-none"
      />
    </label>
  );
}
function Select({ label, value, onChange, options }: any) {
  return (
    <label className="block">
      <div className="text-xs text-[#a8a8a8] mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-3 py-2 outline-none focus:border-[#c4a15a] transition"
      >
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
function DateCell({ label, value, onChange }: any) {
  return (
    <label className="block">
      <div className="text-xs text-[#a8a8a8] mb-1">{label}</div>
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-3 py-2 outline-none focus:border-[#c4a15a] transition"
      />
    </label>
  );
}
