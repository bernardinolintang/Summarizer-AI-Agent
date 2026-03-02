import { useState, useRef } from "react";
import {
  Youtube,
  FileUp,
  Type,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { summarizeYouTube, summarizeUpload, summarizeText } from "../lib/api";

const TABS = [
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "upload", label: "File Upload", icon: FileUp },
  { id: "text", label: "Paste Text", icon: Type },
];

export default function SummarizeView({ collections, onSummaryCreated }) {
  const [tab, setTab] = useState("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [collectionId, setCollectionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let res;
      if (tab === "youtube") {
        if (!youtubeUrl.trim()) throw new Error("Please enter a YouTube URL.");
        res = await summarizeYouTube(youtubeUrl, collectionId);
      } else if (tab === "upload") {
        if (!file) throw new Error("Please select a file.");
        res = await summarizeUpload(file, collectionId);
      } else {
        if (!textInput.trim()) throw new Error("Please enter some text.");
        res = await summarizeText(textInput, "Manual Input", collectionId);
      }
      setResult(res);
      onSummaryCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Summarize Content</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Paste a YouTube link, upload a document, or enter text directly.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setError(null); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === id
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        {tab === "youtube" && (
          <input
            type="url"
            className="input-field"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
        )}

        {tab === "upload" && (
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files[0];
              if (dropped) setFile(dropped);
            }}
          >
            <FileUp size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {file ? file.name : "Drop a PDF, DOCX, or image here — or click to browse"}
            </p>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.tiff,.bmp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        )}

        {tab === "text" && (
          <textarea
            className="input-field min-h-[160px] resize-y"
            placeholder="Paste your text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        )}

        <div className="relative">
          <select
            className="input-field appearance-none pr-10"
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
          >
            <option value="">No collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize"
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 animate-fade-in">
          <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-green-500" />
            <h2 className="font-semibold text-lg">Summary</h2>
            {result.saved === false && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                not saved
              </span>
            )}
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown>{result.summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
