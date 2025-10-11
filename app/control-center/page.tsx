"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* =======================================================
   Tipos
======================================================= */
type Section =
  | "dashboard"
  | "progreso"
  | "hitos"
  | "metricas"
  | "recursos"
  | "personal_dashboard"
  | "personal_plan"
  | "personal_objetivos"
  | "personal_notas"
  | "personal_mindset"
  | "personal_finanzas";
type Mode = "business" | "personal";

type MilestoneStatus = "pending" | "in_progress" | "done";
type Milestone = {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: MilestoneStatus;
};
type Task = { id: string; title: string; tag?: string; done: boolean };
type Habit = { id: string; name: string; done: boolean };
type PersonalState = {
  habitsByDate: Record<string, Habit[]>;
  journalByDate: Record<string, { answers: string[] }>;
};

/* =======================================================
   Datos base
======================================================= */
const defaultMilestones: Milestone[] = [
  {
    id: "1",
    title: "Inicio del proyecto",
    date: "2025-09-20",
    status: "done",
    description: "Estructura base del repo y convenciones.",
  },
  {
    id: "2",
    title: "Módulo de Lecturas (listo)",
    date: "2025-10-09",
    status: "done",
    description: "Listado, estado leído/pendiente y detalles.",
  },
  {
    id: "3",
    title: "Timeline de Progreso",
    date: "2025-10-11",
    status: "in_progress",
    description: "Vista vertical con hitos y % de avance.",
  },
  {
    id: "4",
    title: "Métricas e Insights",
    date: "2025-10-14",
    status: "pending",
    description: "KPIs y tarjetas con tendencias.",
  },
];

const defaultTasks: Task[] = [
  {
    id: "t1",
    title: "Definir esquema de datos para progreso",
    tag: "Progreso",
    done: true,
  },
  {
    id: "t2",
    title: "Sincronizar estados con backend (mock)",
    tag: "Integración",
    done: false,
  },
  {
    id: "t3",
    title: "Diseño final de tarjetas de métricas",
    tag: "UI",
    done: false,
  },
  {
    id: "t4",
    title: "QA de accesibilidad en teclado",
    tag: "A11y",
    done: false,
  },
];

const defaultHabitsTemplate: Habit[] = [
  { id: "h1", name: "Leer 10 min", done: false },
  { id: "h2", name: "Entrenar", done: false },
  { id: "h3", name: "Meditar", done: false },
];

const JOURNAL_QUESTIONS = [
  "¿Qué aprendí hoy?",
  "¿Por qué estoy agradecido hoy?",
  "¿Qué quiero mejorar mañana?",
  "¿Cómo me sentí en general?",
];

/* =======================================================
   Utilidades de fecha
======================================================= */
const toDateKey = (d: Date) => d.toISOString().split("T")[0];
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDayShort(d: Date) {
  return d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
}
function formatDate(d: Date) {
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
}

/* =======================================================
   Componentes base de UI
======================================================= */
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className={`rounded-2xl border border-slate-200/10 bg-white/5 p-5 shadow-sm backdrop-blur dark:border-slate-700/40 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-800/40 overflow-hidden">
      <motion.div
        className="h-2 rounded-full bg-emerald-400"
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
}

function SidebarItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/5 " +
        (active
          ? "bg-white/5 font-medium text-white"
          : "text-slate-400 hover:text-white")
      }
    >
      <span>{label}</span>
      {active ? <span className="text-xs text-slate-400">●</span> : null}
    </button>
  );
}

/* =======================================================
   Vistas empresariales (sin cambios)
======================================================= */
function ViewDashboard({ milestones }: { milestones: Milestone[] }) {
  const completion = useMemo(() => {
    const done = milestones.filter((m) => m.status === "done").length;
    return Math.round((done / milestones.length) * 100);
  }, [milestones]);

  const nextMilestone =
    milestones.find((m) => m.status === "in_progress") ||
    milestones.find((m) => m.status === "pending");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">
            Resumen del proyecto
          </h3>
          <span className="inline-flex items-center rounded-md border border-slate-700/40 px-2 py-0.5 text-xs font-medium text-slate-300">
            {completion}% completado
          </span>
        </div>
        <ProgressBar value={completion} />
        {nextMilestone ? (
          <div className="mt-4 text-sm text-slate-400">
            Siguiente hito:{" "}
            <span className="font-medium text-white">
              {nextMilestone.title}
            </span>{" "}
            · {new Date(nextMilestone.date).toLocaleDateString()}
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-400">
            No hay hitos próximos.
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-semibold tracking-tight">
          Acceso rápido
        </h3>
        <div className="space-y-2">
          <a
            className="block rounded-lg border border-slate-700/60 px-3 py-2 text-sm hover:bg-white/5"
            href="#progreso"
          >
            Ver Progreso / Timeline
          </a>
          <a
            className="block rounded-lg border border-slate-700/60 px-3 py-2 text-sm hover:bg-white/5"
            href="#hitos"
          >
            Hitos y tareas
          </a>
          <a
            className="block rounded-lg border border-slate-700/60 px-3 py-2 text-sm hover:bg-white/5"
            href="#metricas"
          >
            Métricas
          </a>
        </div>
      </Card>
    </div>
  );
}
/* =======================================================
   VISTAS PERSONALES
======================================================= */

/* ------------------- CALENDARIO SEMANAL ------------------- */
function WeeklyCalendar({
  currentDate,
  setCurrentDate,
  habitsPerDayCount,
  allHabitsCount,
}: {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  habitsPerDayCount: Record<string, number>;
  allHabitsCount: number;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const todayKey = toDateKey(new Date());
  const base = startOfWeek(addDays(currentDate, weekOffset * 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(base, i));

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Semana</h2>
        <div className="flex gap-2">
          <button onClick={() => setWeekOffset((n) => n - 1)} className="px-2 py-1 border rounded">◀</button>
          <button onClick={() => setWeekOffset(0)} className="px-2 py-1 border rounded">Hoy</button>
          <button onClick={() => setWeekOffset((n) => n + 1)} className="px-2 py-1 border rounded">▶</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {days.map((d) => {
          const key = toDateKey(d);
          const completed = habitsPerDayCount[key] || 0;
          const isToday = key === todayKey;
          const full = completed >= allHabitsCount && allHabitsCount > 0;
          return (
            <div
              key={key}
              onClick={() => setCurrentDate(d)}
              className={`cursor-pointer rounded-xl p-2 transition ${
                isToday ? "ring-2 ring-sky-400" : "ring-0"
              } ${full ? "bg-emerald-500/20" : "bg-slate-800/40"}`}
            >
              <div>{formatDayShort(d)}</div>
              <div className="text-lg font-semibold">{d.getDate()}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------- JOURNAL ------------------- */
function JournalFlow({
  dateKey,
  personal,
  setPersonal,
}: {
  dateKey: string;
  personal: PersonalState;
  setPersonal: React.Dispatch<React.SetStateAction<PersonalState>>;
}) {
  const existing = personal.journalByDate[dateKey]?.answers || [];
  const [step, setStep] = useState(Math.min(existing.length, JOURNAL_QUESTIONS.length));
  const [value, setValue] = useState("");

  const handleNext = () => {
    const answers = personal.journalByDate[dateKey]?.answers || [];
    if (value.trim().length === 0) return;
    const updated = [...answers];
    updated[step] = value.trim();
    setPersonal((prev) => ({
      ...prev,
      journalByDate: { ...prev.journalByDate, [dateKey]: { answers: updated } },
    }));
    setValue("");
    setStep((s) => Math.min(s + 1, JOURNAL_QUESTIONS.length));
  };

  const completed =
    (personal.journalByDate[dateKey]?.answers?.length || 0) >= JOURNAL_QUESTIONS.length;

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-2">Journal</h2>
      {!completed ? (
        <div className="space-y-3">
          <div>{JOURNAL_QUESTIONS[step] ?? JOURNAL_QUESTIONS[0]}</div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escribe aquí tu respuesta..."
            className="w-full rounded bg-slate-800/50 p-2"
          />
          <button onClick={handleNext} className="px-3 py-1 bg-slate-700 rounded">
            Guardar y siguiente
          </button>
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          {personal.journalByDate[dateKey]?.answers.map((ans, i) => (
            <li key={i} className="rounded bg-slate-800/40 p-2">
              <div className="text-xs text-slate-400">{JOURNAL_QUESTIONS[i]}</div>
              <div>{ans}</div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ------------------- DASHBOARD PERSONAL ------------------- */
function PersonalDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateKey = toDateKey(currentDate);
  const [personal, setPersonal] = useState<PersonalState>(() => {
    const stored = localStorage.getItem("personal");
    if (stored) return JSON.parse(stored);
    return { habitsByDate: {}, journalByDate: {} };
  });

  const [tasks, setTasks] = useState<{ text: string; done: boolean }[]>(() => {
    const saved = localStorage.getItem("personalTasks");
    const lastDate = localStorage.getItem("personalTasksDate");
    const today = toDateKey(new Date());
    if (saved && lastDate === today) return JSON.parse(saved);
    return [];
  });
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem("personal", JSON.stringify(personal));
  }, [personal]);
  useEffect(() => {
    localStorage.setItem("personalTasks", JSON.stringify(tasks));
    localStorage.setItem("personalTasksDate", toDateKey(new Date()));
  }, [tasks]);

  const habits = personal.habitsByDate[dateKey] || defaultHabitsTemplate;
  const toggleHabit = (id: string) => {
    setPersonal((prev) => {
      const dayHabits =
        prev.habitsByDate[dateKey] || defaultHabitsTemplate.map((h) => ({ ...h }));
      const updated = dayHabits.map((h) =>
        h.id === id ? { ...h, done: !h.done } : h
      );
      return {
        ...prev,
        habitsByDate: { ...prev.habitsByDate, [dateKey]: updated },
      };
    });
  };

  const habitsPerDayCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const [dk, list] of Object.entries(personal.habitsByDate))
      map[dk] = list.filter((h) => h.done).length;
    return map;
  }, [personal.habitsByDate]);
  const allHabitsCount = defaultHabitsTemplate.length;

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { text: newTask, done: false }]);
    setNewTask("");
  };
  const toggleTask = (i: number) =>
    setTasks(tasks.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <WeeklyCalendar
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        habitsPerDayCount={habitsPerDayCount}
        allHabitsCount={allHabitsCount}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-3">Hábitos del {formatDate(currentDate)}</h2>
          <ul className="space-y-2">
            {habits.map((h) => (
              <li
                key={h.id}
                onClick={() => toggleHabit(h.id)}
                className="flex justify-between px-3 py-2 border rounded cursor-pointer hover:bg-slate-800/40"
              >
                <span className={h.done ? "line-through text-slate-400" : ""}>{h.name}</span>
                <span className={h.done ? "text-emerald-400" : "text-slate-500"}>
                  {h.done ? "✓" : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-semibold mb-3">🗒️ To-Do List</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nueva tarea..."
              className="flex-1 bg-slate-800/40 p-2 rounded"
            />
            <button onClick={addTask} className="bg-slate-700 px-3 rounded">
              Añadir
            </button>
          </div>
          <ul className="space-y-2">
            {tasks.map((t, i) => (
              <li
                key={i}
                onClick={() => toggleTask(i)}
                className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-slate-800/40"
              >
                <div
                  className={`h-5 w-5 flex items-center justify-center rounded border ${
                    t.done ? "border-emerald-400 bg-emerald-500/20" : "border-slate-600"
                  }`}
                >
                  {t.done && <span className="text-emerald-400 text-sm">✓</span>}
                </div>
                <span className={t.done ? "line-through text-slate-400" : ""}>{t.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <JournalFlow dateKey={dateKey} personal={personal} setPersonal={setPersonal} />
    </motion.div>
  );
}

/* ------------------- PLAN SEMANAL VISUAL ------------------- */
function ViewPlanSemanal() {
  const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  type Evento = {
    id: string;
    dia: number;
    titulo: string;
    hora: string;
    nota: string;
    color: string;
  };

  const colores = [
    "bg-emerald-500/30 border-emerald-400/40",
    "bg-sky-500/30 border-sky-400/40",
    "bg-pink-500/30 border-pink-400/40",
    "bg-violet-500/30 border-violet-400/40",
    "bg-amber-500/30 border-amber-400/40",
  ];

  const [eventos, setEventos] = useState<Evento[]>(
    () => JSON.parse(localStorage.getItem("planSemanalEventos") || "[]")
  );
  useEffect(() => localStorage.setItem("planSemanalEventos", JSON.stringify(eventos)), [eventos]);

  const [open, setOpen] = useState(false);
  const [nuevo, setNuevo] = useState<{ dia: number; titulo: string; hora: string; nota: string; color: string }>({
    dia: 0,
    titulo: "",
    hora: "08:00",
    nota: "",
    color: colores[0],
  });

  const abrirModal = (dia: number) => {
    setNuevo({ dia, titulo: "", hora: "08:00", nota: "", color: colores[Math.floor(Math.random() * colores.length)] });
    setOpen(true);
  };

  const guardarEvento = () => {
    if (!nuevo.titulo.trim()) return;
    setEventos([{ id: crypto.randomUUID(), ...nuevo }, ...eventos]);
    setOpen(false);
  };

  const eliminarEvento = (id: string) => setEventos(eventos.filter((e) => e.id !== id));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">📆 Planificador semanal</h2>

      {/* Grid de días */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {dias.map((dia, i) => {
          const eventosDia = eventos
            .filter((e) => e.dia === i)
            .sort((a, b) => a.hora.localeCompare(b.hora));

          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-3 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white text-sm">{dia}</h3>
                <button
                  onClick={() => abrirModal(i)}
                  className="text-slate-400 hover:text-white transition text-xs"
                >
                  ➕
                </button>
              </div>

              {eventosDia.length === 0 ? (
                <div className="text-slate-600 text-xs mt-2 italic">Sin eventos</div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[250px]">
                  {eventosDia.map((e) => (
                    <div
                      key={e.id}
                      className={`rounded-lg border ${e.color} p-2 cursor-pointer hover:opacity-90 transition`}
                      onClick={() => eliminarEvento(e.id)}
                      title="Haz clic para eliminar"
                    >
                      <div className="text-xs font-medium text-white">{e.hora} — {e.titulo}</div>
                      {e.nota && (
                        <div className="text-[11px] text-slate-200 mt-1 leading-snug">{e.nota}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[340px] shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Nuevo evento</h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block mb-1 text-slate-400">Día</label>
                <select
                  value={nuevo.dia}
                  onChange={(e) => setNuevo({ ...nuevo, dia: +e.target.value })}
                  className="w-full bg-slate-800/40 p-2 rounded"
                >
                  {dias.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Hora</label>
                <input
                  type="time"
                  step="900"
                  value={nuevo.hora}
                  onChange={(e) => setNuevo({ ...nuevo, hora: e.target.value })}
                  className="w-full bg-slate-800/40 p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Título</label>
                <input
                  value={nuevo.titulo}
                  onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
                  placeholder="Ej. Clase de mates"
                  className="w-full bg-slate-800/40 p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Nota</label>
                <textarea
                  value={nuevo.nota}
                  onChange={(e) => setNuevo({ ...nuevo, nota: e.target.value })}
                  placeholder="Detalles, aula, profesor..."
                  className="w-full bg-slate-800/40 p-2 rounded h-16"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1 bg-slate-700 rounded">
                Cancelar
              </button>
              <button
                onClick={guardarEvento}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



/* ------------------- OBJETIVOS ------------------- */
function ViewObjetivos() {
  const [goals, setGoals] = useState<{ text: string; done: boolean }[]>(
    () => JSON.parse(localStorage.getItem("objetivos") || "[]")
  );
  const [newGoal, setNewGoal] = useState("");
  useEffect(() => localStorage.setItem("objetivos", JSON.stringify(goals)), [goals]);
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-3">🏆 Objetivos personales</h2>
      <div className="flex gap-2 mb-3">
        <input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Nuevo objetivo..."
          className="flex-1 bg-slate-800/40 p-2 rounded"
        />
        <button
          onClick={() => {
            if (!newGoal.trim()) return;
            setGoals([...goals, { text: newGoal, done: false }]);
            setNewGoal("");
          }}
          className="bg-slate-700 px-3 rounded"
        >
          Añadir
        </button>
      </div>
      <ul className="space-y-2">
        {goals.map((g, i) => (
          <li
            key={i}
            onClick={() =>
              setGoals(goals.map((x, idx) => (idx === i ? { ...x, done: !x.done } : x)))
            }
            className="flex justify-between p-2 border rounded cursor-pointer hover:bg-slate-800/40"
          >
            <span className={g.done ? "line-through text-slate-400" : ""}>{g.text}</span>
            {g.done && <span className="text-emerald-400">✓</span>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------- NOTAS ------------------- */
function ViewNotas() {
  const [notes, setNotes] = useState(localStorage.getItem("notas") || "");
  useEffect(() => localStorage.setItem("notas", notes), [notes]);
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-3">💬 Notas rápidas</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Apunta aquí ideas o pensamientos..."
        className="w-full bg-slate-800/40 p-3 rounded h-64"
      />
    </Card>
  );
}

/* ------------------- MINDSET ------------------- */
function ViewMindset() {
  const [quotes] = useState([
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "Hazlo con pasión o no lo hagas.",
    "Tu disciplina define tu futuro.",
  ]);
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-3">💭 Visualización / Mindset</h2>
      <ul className="space-y-2">
        {quotes.map((q, i) => (
          <li key={i} className="border border-slate-700/50 p-3 rounded bg-slate-800/30">
            “{q}”
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------- FINANZAS PREMIUM ------------------- */
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function ViewFinanzas() {
  const [entries, setEntries] = useState<
    { tipo: "ingreso" | "gasto"; descripcion: string; cantidad: number; metodo: "efectivo" | "tarjeta" }[]
  >(() => JSON.parse(localStorage.getItem("finanzas") || "[]"));

  const [form, setForm] = useState({
    tipo: "ingreso" as "ingreso" | "gasto",
    metodo: "tarjeta" as "efectivo" | "tarjeta",
    descripcion: "",
    cantidad: "",
  });

  useEffect(() => localStorage.setItem("finanzas", JSON.stringify(entries)), [entries]);

  const addEntry = () => {
    const val = parseFloat(form.cantidad);
    if (!form.descripcion.trim() || isNaN(val)) return;
    setEntries([{ ...form, cantidad: val }, ...entries]);
    setForm({ tipo: "ingreso", metodo: "tarjeta", descripcion: "", cantidad: "" });
  };

  const totalIngresos = entries
    .filter((e) => e.tipo === "ingreso")
    .reduce((acc, e) => acc + e.cantidad, 0);
  const totalGastos = entries
    .filter((e) => e.tipo === "gasto")
    .reduce((acc, e) => acc + e.cantidad, 0);
  const balance = totalIngresos - totalGastos;

  const data = [
    { name: "Ingresos", value: totalIngresos },
    { name: "Gastos", value: totalGastos },
  ];
  const COLORS = ["#10B981", "#EF4444"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-lg font-semibold">💰 Finanzas personales</h2>

      {/* SECCIÓN SUPERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance principal */}
        <Card className="flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-900/80 to-slate-800/60">
          <div className="text-sm text-slate-400">Balance actual</div>
          <div className={`text-4xl font-bold mt-1 ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {balance.toFixed(2)} €
          </div>
          <div className="text-xs text-slate-500 mt-1">Actualizado automáticamente</div>
        </Card>

        {/* Ingresos */}
        <Card className="flex flex-col items-center justify-center text-center border-emerald-500/30">
          <div className="text-sm text-emerald-400">Ingresos totales</div>
          <div className="text-2xl font-semibold text-emerald-300">{totalIngresos.toFixed(2)} €</div>
          <div className="text-xs text-slate-500 mt-1">Últimos añadidos abajo</div>
        </Card>

        {/* Gastos */}
        <Card className="flex flex-col items-center justify-center text-center border-red-500/30">
          <div className="text-sm text-red-400">Gastos totales</div>
          <div className="text-2xl font-semibold text-red-300">{totalGastos.toFixed(2)} €</div>
          <div className="text-xs text-slate-500 mt-1">Últimos añadidos abajo</div>
        </Card>
      </div>

      {/* GRAFICO */}
      <Card className="flex flex-col items-center justify-center">
        <h3 className="text-sm text-slate-400 mb-2">Distribución general</h3>
        <div className="w-full h-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 text-xs mt-2 text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-emerald-400 rounded-full" /> Ingresos
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-400 rounded-full" /> Gastos
          </span>
        </div>
      </Card>

      {/* FORMULARIO */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Añadir transacción</h3>
        <div className="flex flex-wrap gap-2 mb-3 text-sm">
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
            className="bg-slate-800/40 p-2 rounded"
          >
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </select>
          <select
            value={form.metodo}
            onChange={(e) => setForm({ ...form, metodo: e.target.value as any })}
            className="bg-slate-800/40 p-2 rounded"
          >
            <option value="tarjeta">Tarjeta</option>
            <option value="efectivo">Efectivo</option>
          </select>
          <input
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Descripción"
            className="flex-1 bg-slate-800/40 p-2 rounded"
          />
          <input
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            placeholder="Cantidad (€)"
            type="number"
            className="w-32 bg-slate-800/40 p-2 rounded"
          />
          <button
            onClick={addEntry}
            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded text-sm"
          >
            Añadir
          </button>
        </div>
      </Card>

      {/* LISTA DE MOVIMIENTOS */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Historial de movimientos</h3>
        {entries.length === 0 ? (
          <div className="text-slate-500 text-sm italic">Sin registros todavía.</div>
        ) : (
          <ul className="divide-y divide-slate-800 text-sm">
            {entries.map((e, i) => (
              <li
                key={i}
                className="flex justify-between items-center py-2 text-slate-300"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {e.descripcion}{" "}
                    <span
                      className={`text-xs ${
                        e.metodo === "tarjeta"
                          ? "text-sky-400"
                          : "text-amber-400"
                      }`}
                    >
                      ({e.metodo})
                    </span>
                  </span>
                  <span className="text-xs text-slate-500">{e.tipo === "ingreso" ? "Ingreso" : "Gasto"}</span>
                </div>
                <div
                  className={`font-semibold ${
                    e.tipo === "ingreso" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {e.tipo === "ingreso" ? "+" : "-"}
                  {e.cantidad.toFixed(2)} €
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.div>
  );
}

/* =======================================================
   COMPONENTE PRINCIPAL
======================================================= */
export default function ControlCenter() {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem("mode") as Mode) || "business"
  );
  const [section, setSection] = useState<Section>(
    () => (localStorage.getItem("section") as Section) || "dashboard"
  );
  const [milestones, setMilestones] = useState<Milestone[]>(
    () => JSON.parse(localStorage.getItem("milestones") || "null") || defaultMilestones
  );
  const [tasks, setTasks] = useState<Task[]>(
    () => JSON.parse(localStorage.getItem("tasks") || "null") || defaultTasks
  );

  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("section", section);
  }, [section]);

  useEffect(() => {
    localStorage.setItem("milestones", JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 antialiased"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-[260px_1fr]">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 backdrop-blur">
          <div className="mb-4 px-2">
            <div className="text-xs uppercase tracking-wider text-slate-400">Centro</div>
            <div className="mt-1 text-base font-semibold">
              {mode === "business" ? "Proyecto" : "Vida personal"}
            </div>
          </div>

          {/* Cambiar modo */}
          <button
            onClick={() => setMode(mode === "business" ? "personal" : "business")}
            className="mb-4 w-full rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
          >
            Cambiar a modo {mode === "business" ? "Personal" : "Empresarial"}
          </button>

          {/* Navegación dinámica */}
          {mode === "business" ? (
            <nav className="space-y-1">
              <SidebarItem label="Resumen" active={section === "dashboard"} onClick={() => setSection("dashboard")} />
              <SidebarItem label="Progreso / Timeline" active={section === "progreso"} onClick={() => setSection("progreso")} />
              <SidebarItem label="Hitos" active={section === "hitos"} onClick={() => setSection("hitos")} />
              <SidebarItem label="Métricas" active={section === "metricas"} onClick={() => setSection("metricas")} />
            </nav>
          ) : (
            <nav className="space-y-1">
              <SidebarItem label="🏠 Dashboard" active={section === "personal_dashboard"} onClick={() => setSection("personal_dashboard")} />
              <SidebarItem label="📆 Plan semanal" active={section === "personal_plan"} onClick={() => setSection("personal_plan")} />
              <SidebarItem label="🏆 Objetivos" active={section === "personal_objetivos"} onClick={() => setSection("personal_objetivos")} />
              <SidebarItem label="💬 Notas" active={section === "personal_notas"} onClick={() => setSection("personal_notas")} />
              <SidebarItem label="💭 Mindset" active={section === "personal_mindset"} onClick={() => setSection("personal_mindset")} />
              <SidebarItem label="💰 Finanzas" active={section === "personal_finanzas"} onClick={() => setSection("personal_finanzas")} />
            </nav>
          )}
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "business" ? "Modo Empresarial" : "Modo Personal"}
          </h1>

          <AnimatePresence mode="wait">
            {mode === "business" ? (
              <>
                {section === "dashboard" && <ViewDashboard milestones={milestones} />}
              </>
            ) : (
              <>
                {section === "personal_dashboard" && <PersonalDashboard />}
                {section === "personal_plan" && <ViewPlanSemanal />}
                {section === "personal_objetivos" && <ViewObjetivos />}
                {section === "personal_notas" && <ViewNotas />}
                {section === "personal_mindset" && <ViewMindset />}
                {section === "personal_finanzas" && <ViewFinanzas />}
              </>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
