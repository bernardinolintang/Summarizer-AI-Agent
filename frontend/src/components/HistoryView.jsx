import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Youtube,
  FileText,
  Type,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { fetchSummaries, deleteSummary } from "../lib/api";

const SOURCE_ICONS = {
  youtube: Youtube,
  document: FileText,
  text: Type,
};

export default function HistoryView({ collections }) {
  const [summaries, setSummaries] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCollection, setFilterCollection] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSummaries(filterCollection, search);
      setSummaries(data);
    } catch {
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterCollection]);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this summary?")) return;
    await deleteSummary(id);
    setSummaries((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Browse and search your past summaries.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input-field pl-11"
            placeholder="Search summaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field sm:w-48 appearance-none"
          value={filterCollection}
          onChange={(e) => setFilterCollection(e.target.value)}
        >
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
      ) : summaries.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No summaries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((s) => {
            const Icon = SOURCE_ICONS[s.source_type] || FileText;
            const isOpen = expanded === s.id;
            return (
              <div key={s.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.source_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                      <ReactMarkdown>{s.summary}</ReactMarkdown>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="btn-danger flex items-center gap-2 text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
