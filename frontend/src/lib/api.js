const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.detail || body.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return res.json();
}

// ── Summarize ──────────────────────────────────────────────────────

export async function summarizeYouTube(url, collectionId) {
  return request("/api/summarize/youtube", {
    method: "POST",
    body: JSON.stringify({ url, collection_id: collectionId || null }),
  });
}

export async function summarizeUpload(file, collectionId) {
  const form = new FormData();
  form.append("file", file);
  if (collectionId) form.append("collection_id", collectionId);

  const res = await fetch(`${BASE}/api/summarize/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Upload failed");
  }
  return res.json();
}

export async function summarizeText(text, sourceName, collectionId) {
  return request("/api/summarize/text", {
    method: "POST",
    body: JSON.stringify({
      text,
      source_name: sourceName || "Manual Input",
      collection_id: collectionId || null,
    }),
  });
}

// ── Collections ────────────────────────────────────────────────────

export async function fetchCollections() {
  return request("/api/collections");
}

export async function createCollection(name) {
  return request("/api/collections", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteCollection(collectionId) {
  return request(`/api/collections/${collectionId}`, { method: "DELETE" });
}

// ── Summaries ──────────────────────────────────────────────────────

export async function fetchSummaries(collectionId, search) {
  const params = new URLSearchParams();
  if (collectionId) params.set("collection_id", collectionId);
  if (search) params.set("search", search);
  const qs = params.toString();
  return request(`/api/summaries${qs ? `?${qs}` : ""}`);
}

export async function fetchSummary(summaryId) {
  return request(`/api/summaries/${summaryId}`);
}

export async function deleteSummary(summaryId) {
  return request(`/api/summaries/${summaryId}`, { method: "DELETE" });
}
