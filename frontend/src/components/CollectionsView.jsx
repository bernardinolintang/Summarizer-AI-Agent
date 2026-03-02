import { useState } from "react";
import {
  FolderPlus,
  Trash2,
  Folder,
  Loader2,
} from "lucide-react";
import { createCollection, deleteCollection } from "../lib/api";

export default function CollectionsView({ collections, onCollectionsChanged }) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createCollection(name.trim());
      setName("");
      onCollectionsChanged();
    } catch {
      // silently handled
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this collection? Summaries inside will be unlinked.")) return;
    await deleteCollection(id);
    onCollectionsChanged();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Organize your summaries into groups.
        </p>
      </div>

      <div className="card p-4 flex gap-3">
        <input
          className="input-field flex-1"
          placeholder="New collection name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          {creating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FolderPlus size={16} />
          )}
          Create
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="card p-12 text-center">
          <Folder size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No collections yet. Create one above.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className="card p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  <Folder
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Delete collection"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
