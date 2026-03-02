# Summarizer AI Agent

A **private, self-hosted AI agent** that summarizes YouTube videos, PDFs, and documents using **Groq llama-3.3-70b-versatile**. All data stays local in **SQLite** — no cloud dependencies, no accounts, no data sharing.

## Features

- **YouTube** — Paste a link, get a structured summary from the transcript
- **PDF & DOCX** — Upload documents with text extraction (+ OCR fallback)
- **Paste Text** — Summarize any text directly
- **Collections** — Organize summaries into named groups
- **Search & Filter** — Find past summaries instantly
- **Dark Mode** — System-aware toggle with persistent preference
- **Mobile Responsive** — Works on all screen sizes
- **100% Local** — SQLite database, no cloud, no sign-up

## Quick Start

### 1. Get a Groq API key

Sign up free at [console.groq.com](https://console.groq.com) and create an API key.

### 2. Backend

```bash
cd backend
pip install -r requirements.txt

# Create your .env with your key
echo GROQ_API_KEY=gsk_your_key_here > .env

uvicorn app.main:app --reload --port 8001
```

Backend runs at `http://localhost:8001`. SQLite DB is created automatically at `backend/data/summaries.db`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/api/*` to the backend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/summarize/youtube` | Summarize a YouTube video |
| `POST` | `/api/summarize/upload` | Summarize an uploaded file |
| `POST` | `/api/summarize/text` | Summarize pasted text |
| `GET` | `/api/summaries` | List summaries (search/filter) |
| `GET` | `/api/summaries/:id` | Get a single summary |
| `DELETE` | `/api/summaries/:id` | Delete a summary |
| `GET` | `/api/collections` | List collections |
| `POST` | `/api/collections` | Create a collection |
| `DELETE` | `/api/collections/:id` | Delete a collection |
| `GET` | `/health` | Health check |

## Project Structure

```
backend/
  app/
    routes/          API endpoints
    services/        Groq, YouTube, document processing, storage
    config.py        Settings from .env
    database.py      SQLite setup & connection
    main.py          FastAPI app
  data/              SQLite database (auto-created, gitignored)
  .env               Your Groq API key (gitignored)
  requirements.txt

frontend/
  src/
    components/      UI views (Summarize, History, Collections)
    context/         Dark mode theme
    lib/api.js       API client
```

## Tech Stack

- **LLM**: Groq llama-3.3-70b-versatile
- **Backend**: Python, FastAPI, SQLite
- **Frontend**: React 19, Vite, Tailwind CSS v4
- **No cloud dependencies**

## License

MIT
