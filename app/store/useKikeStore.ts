import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Tipos
export type Task = { id: string; title: string; tag?: string; done: boolean; createdAt: number };
export type Habit = { id: string; label: string; active: boolean };
export type HabitCheck = { id: string; habitId: string; date: string; value: boolean };
export type Book = {
  id: string;
  title: string;
  author?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status: "en-curso" | "completado";
  notes?: string;
};
export type ProgressEvent = { id: string; ts: number; type: "Tarea"|"Hábito"|"Lectura"|"Sistema"; detail: string; meta?: any };

type Theme = "porsche-dark" | "oldmoney-light";

type Profile = {
  name: string;
  avatarUrl?: string; // futura subida
};

type Store = {
  // Datos
  tasks: Task[];
  habits: Habit[];
  habitChecks: HabitCheck[];
  books: Book[];
  progress: ProgressEvent[];
  theme: Theme;
  profile: Profile;

  // Acciones: tareas
  addTask: (title: string, tag?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;

  // Hábitos
  addHabit: (label: string) => void;
  toggleHabitActive: (id: string) => void;
  checkHabitToday: (habitId: string, value: boolean) => void;

  // Libros
  addBook: (b: Omit<Book, "id">) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  removeBook: (id: string) => void;

  // Progreso
  log: (e: Omit<ProgressEvent, "id" | "ts">) => void;

  // Perfil / Tema
  setTheme: (t: Theme) => void;
  setProfile: (p: Partial<Profile>) => void;

  // Util
  resetAll: () => void;
};

const uid = () => Math.random().toString(36).slice(2);

export const useKikeStore = create<Store>()(
  persist(
    (set, get) => ({
      tasks: [
        { id: uid(), title: "Prospectar 15 leads", tag: "Agencia", done: false, createdAt: Date.now() },
      ],
      habits: [
        { id: uid(), label: "Dormir 22:00–06:00", active: true },
        { id: uid(), label: "Gym", active: true },
      ],
      habitChecks: [],
      books: [],
      progress: [],
      theme: "porsche-dark",
      profile: { name: "Kike Silla" },

      addTask: (title, tag) => {
        const t: Task = { id: uid(), title, tag, done: false, createdAt: Date.now() };
        set(s => ({ tasks: [t, ...s.tasks] }));
        get().log({ type: "Tarea", detail: `Creada: ${title}` });
      },
      toggleTask: (id) => {
        set(s => {
          const tasks = s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
          const toggled = s.tasks.find(t => t.id === id);
          if (toggled) {
            const txt = toggled.done ? "Reabierta" : "Completada";
            get().log({ type: "Tarea", detail: `${txt}: ${toggled.title}` });
          }
          return { tasks };
        });
      },
      removeTask: (id) => {
        const t = get().tasks.find(x => x.id === id);
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
        if (t) get().log({ type: "Tarea", detail: `Eliminada: ${t.title}` });
      },

      addHabit: (label) => set(s => ({ habits: [...s.habits, { id: uid(), label, active: true }] })),
      toggleHabitActive: (id) =>
        set(s => ({ habits: s.habits.map(h => h.id === id ? { ...h, active: !h.active } : h) })),
      checkHabitToday: (habitId, value) => {
        const today = new Date().toISOString().slice(0,10);
        set(s => {
          const exists = s.habitChecks.find(h => h.habitId === habitId && h.date === today);
          let habitChecks = s.habitChecks;
          if (exists) {
            habitChecks = habitChecks.map(h => h.habitId === habitId && h.date === today ? { ...h, value } : h);
          } else {
            habitChecks = [...habitChecks, { id: uid(), habitId, date: today, value }];
          }
          return { habitChecks };
        });
        get().log({ type: "Hábito", detail: `Check ${value ? "✔" : "✖"} en ${habitId}`, meta: { habitId, date: today } });
      },

      addBook: (b) => {
        const book: Book = { id: uid(), ...b };
        set(s => ({ books: [book, ...s.books] }));
        get().log({ type: "Lectura", detail: `Añadido: ${book.title}`, meta: book });
      },
      updateBook: (id, patch) => {
        set(s => ({ books: s.books.map(b => b.id === id ? { ...b, ...patch } : b) }));
        const b = get().books.find(x => x.id === id);
        if (b) get().log({ type: "Lectura", detail: `Actualizado: ${b.title}` });
      },
      removeBook: (id) => {
        const b = get().books.find(x => x.id === id);
        set(s => ({ books: s.books.filter(b => b.id !== id) }));
        if (b) get().log({ type: "Lectura", detail: `Eliminado: ${b.title}` });
      },

      log: (e) => set(s => ({ progress: [{ id: uid(), ts: Date.now(), ...e }, ...s.progress].slice(0, 500) })),

      setTheme: (t) => set({ theme: t }),
      setProfile: (p) => set(s => ({ profile: { ...s.profile, ...p } })),

      resetAll: () => set({
        tasks: [],
        habits: [],
        habitChecks: [],
        books: [],
        progress: [],
        theme: "porsche-dark",
        profile: { name: "Kike Silla" },
      }),
    }),
    {
      name: "kikehq-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tasks: s.tasks,
        habits: s.habits,
        habitChecks: s.habitChecks,
        books: s.books,
        progress: s.progress,
        theme: s.theme,
        profile: s.profile,
      }),
    }
  )
);
