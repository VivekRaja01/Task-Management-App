import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListTodo, Clock, Loader2, CheckCircle2 } from "lucide-react";

// ----------- Utilities -----------
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const STATUS = [
  { value: "todo", label: "To Do", icon: Clock },
  { value: "inprogress", label: "In Progress", icon: Loader2 },
  { value: "done", label: "Done", icon: CheckCircle2 },
];

const PRIORITY = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ----------- Seed Data -----------
const seedTasks = () => [
  {
    id: uid(),
    title: "Design landing page",
    description: "Create hero section, CTA, and responsive grid.",
    status: "inprogress",
    priority: "high",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    createdAt: Date.now(),
  },
  {
    id: uid(),
    title: "Write API documentation",
    description: "Cover auth, rate limits, and examples.",
    status: "todo",
    priority: "medium",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    createdAt: Date.now(),
  },
  {
    id: uid(),
    title: "Fix login bug",
    description: "Resolve redirect loop on session refresh.",
    status: "done",
    priority: "critical",
    dueDate: new Date().toISOString().slice(0, 10),
    createdAt: Date.now(),
  },
];

// ----------- Shell Layout -----------
function Shell({ children }) {
  return (
    <div className="min-h-screen text-black bg-gray-50">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90">
            <div className="h-9 w-9 rounded-2xl bg-gray-200 grid place-items-center border border-gray-300">
              <ListTodo className="h-5 w-5 text-gray-700" />
            </div>
            <span className="font-semibold tracking-wide text-gray-800 hover:bg-yellow-600/50">TaskFlow Pro</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link to="/" className="px-3 py-2 rounded-xl hover:bg-orange-600/50 border border-purple-700 text-sm text-gray-700">Home</Link>
            <Link to="/create" className="px-3 py-2 rounded-xl bg-orange-600 text-white hover:bg-pink-500 text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Task
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}

// ----------- Toast ----------
function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="px-4 py-3 rounded-2xl bg-gray-800/90 border border-gray-700 shadow-xl text-sm text-white">{message}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ----------- Task Form ----------
function TaskForm({ tasks, setTasks }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const task = tasks.find((t) => t.id === id) || {};

  const [title, setTitle] = useState(task.title || "");
  const [desc, setDesc] = useState(task.description || "");
  const [status, setStatus] = useState(task.status || "todo");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [dueDate, setDueDate] = useState(task.dueDate || new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const save = () => {
    if (!title.trim()) { setError("Title required"); return; }
    const updatedTask = { id: editing ? id : uid(), title, description: desc, status, priority, dueDate, createdAt: editing ? task.createdAt : Date.now() };
    const newTasks = editing ? tasks.map((t) => t.id === id ? updatedTask : t) : [...tasks, updatedTask];
    setTasks(newTasks);
    setToast(editing ? "Task updated!" : "Task created!");
    setTimeout(() => { navigate("/"); }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">{editing ? "Edit Task" : "Create Task"}</h1>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-yellow-400 text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-yellow-400 text-gray-800" />
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-yellow-400 text-gray-800">
              {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-yellow-400 text-gray-800">
              {PRIORITY.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-yellow-400 text-gray-800" />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button onClick={save} className="px-4 py-2 rounded-xl bg-green-500 hover:bg-yellow-400 shadow text-white">Save Task</button>
      </div>
      <Toast message={toast} />
    </motion.div>
  );
}

// ----------- Home Page -----------
function HomePage({ tasks, setTasks }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (debouncedSearch) list = list.filter(t => t.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (statusFilter) list = list.filter(t => t.status === statusFilter);
    if (priorityFilter) list = list.filter(t => t.priority === priorityFilter);
    return list;
  }, [tasks, debouncedSearch, statusFilter, priorityFilter]);

  const deleteTask = (id) => { if (confirm("Delete task?")) setTasks(tasks.filter(t => t.id !== id)); };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h1>
      <div className="mb-4 flex gap-2 flex-wrap">
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800">
          <option value="">All Status</option>
          {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800">
          <option value="">All Priority</option>
          {PRIORITY.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4">
        {filtered.map(t => (
          <div key={t.id} className="p-4 rounded-2xl bg-white border border-gray-300 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-800">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.description}</p>
              <p className="text-xs mt-1 text-gray-500">Status: {t.status}, Priority: {t.priority}, Due: {t.dueDate}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/edit/${t.id}`)} 
                className="px-2 py-1 bg-green-500 rounded hover:bg-blue-600 text-white transition-colors duration-200"
              >
                Edit
              </button>
              <button 
                onClick={() => deleteTask(t.id)} 
                className="px-2 py-1 bg-purple-500 rounded hover:bg-red-700 text-white transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ----------- Main App -----------
export default function App() {
  const [tasks, setTasks] = useLocalStorage("tm_tasks_v1", seedTasks());

  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage tasks={tasks} setTasks={setTasks} />} />
          <Route path="/create" element={<TaskForm tasks={tasks} setTasks={setTasks} />} />
          <Route path="/edit/:id" element={<TaskForm tasks={tasks} setTasks={setTasks} />} />
          <Route path="*" element={<div className="text-gray-800">404 Not Found</div>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
