# 🔥 Project Phoenix — AI Image & Video Generation Platform

A production-ready, full-stack AI application powered by **Gemini APIs**, **LangGraph** agentic workflows, **Supabase** auth/storage, and an **Angular** frontend.

---

## 🏗️ Architecture

```
Angular Frontend (Tailwind CSS)
        ↓
  Supabase Auth (JWT)
        ↓
  FastAPI Backend
        ↓
  LangGraph Agent Pipeline
   ┌─────────────────────────────────────────┐
   │ prompt → style → parameter → safety    │
   │         → generator → evaluator        │
   └─────────────────────────────────────────┘
        ↓
  Gemini APIs (Image + Video)
        ↓
  Supabase Storage + Database
```

---

## ⚡ Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 20+** and npm
- **Supabase** account (free tier works)
- **Google AI** API key with Gemini access

### 1. Clone & Configure

```bash
cd project-phoenix

# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your actual keys:
#   SUPABASE_URL=https://xxx.supabase.co
#   SUPABASE_KEY=your-anon-key
#   GEMINI_API_KEY=your-gemini-key
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run this SQL in the **SQL Editor** to create the `generations` table:

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT DEFAULT '',
  resolution TEXT DEFAULT '1024x1024',
  aspect_ratio TEXT DEFAULT '1:1',
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  output_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

3. Create a **Storage bucket** called `generations` with public access.

### 3. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Visit `/docs` for Swagger UI.

### 4. Frontend

```bash
cd frontend

# Update environment config
# Edit src/environments/environment.ts with your Supabase URL/key

npm install
npm start
```

The app will be live at `http://localhost:4200`.

---

## 📁 Project Structure

```
project-phoenix/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routes/
│   │   │   ├── generate.py      # POST /api/generate/image & /video
│   │   │   └── history.py       # GET /api/history
│   │   ├── agents/
│   │   │   ├── prompt_agent.py  # AI prompt enhancement
│   │   │   ├── style_agent.py   # Style injection
│   │   │   ├── parameter_agent.py # Resolution/aspect ratio
│   │   │   ├── safety_agent.py  # Content safety check
│   │   │   ├── generator_agent.py # Gemini image/video generation
│   │   │   └── evaluator_agent.py # Quality evaluation & retry
│   │   ├── graph/
│   │   │   └── workflow.py      # LangGraph state machine
│   │   ├── services/
│   │   │   ├── gemini_service.py
│   │   │   └── supabase_service.py
│   │   ├── models/
│   │   │   └── state.py         # TypedDict state definition
│   │   └── utils/
│   │       └── auth.py          # Supabase JWT middleware
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── generate/
│   │   │   │   └── history/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── api.service.ts
│   │   │   └── guards/
│   │   │       └── auth.guard.ts
│   │   ├── environments/
│   │   └── styles.scss
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🤖 Agent Pipeline

The LangGraph workflow runs **6 agents** in sequence with conditional routing:

| # | Agent | Purpose |
|---|-------|---------|
| 1 | **Prompt Agent** | Enhances raw prompt using Gemini LLM |
| 2 | **Style Agent** | Appends artistic style descriptors |
| 3 | **Parameter Agent** | Injects resolution & aspect ratio |
| 4 | **Safety Agent** | Rejects unsafe prompts (conditional gate) |
| 5 | **Generator Agent** | Calls Gemini image or Veo video API |
| 6 | **Evaluator Agent** | Scores quality, retries if < 50% (max 2) |

---

## 🔌 API Endpoints

### `POST /api/generate/image`

```json
{
  "prompt": "A futuristic city floating in clouds",
  "style": "Digital Art",
  "resolution": "1024x1024",
  "aspect_ratio": "1:1"
}
```

### `POST /api/generate/video`

Same request body — returns a `job_id` for async polling.

### `GET /api/history`

Returns the authenticated user's generation history.

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase anonymous (public) key |
| `GEMINI_API_KEY` | Google AI API key |

---

## 📜 License

MIT
