import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import SummarizeView from "./components/SummarizeView";
import HistoryView from "./components/HistoryView";
import CollectionsView from "./components/CollectionsView";
import { fetchCollections } from "./lib/api";

export default function App() {
  const [view, setView] = useState("home");
  const [collections, setCollections] = useState([]);

  const loadCollections = useCallback(async () => {
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch {
      // backend may be offline
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={setView} currentView={view} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {view === "home" && (
          <SummarizeView
            collections={collections}
            onSummaryCreated={loadCollections}
          />
        )}
        {view === "history" && (
          <HistoryView collections={collections} />
        )}
        {view === "collections" && (
          <CollectionsView
            collections={collections}
            onCollectionsChanged={loadCollections}
          />
        )}
      </main>
      <footer className="text-center py-6 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-900">
        Summarizer AI &mdash; Private &middot; Local &middot; Powered by Groq
      </footer>
    </div>
  );
}
