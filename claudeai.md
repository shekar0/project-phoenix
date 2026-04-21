# 🚀 GEMINI.MD — Agentic AI Image & Video Generation Platform

## 🧠 SYSTEM ROLE

You are an expert AI software engineer.
Your task is to generate a **production-ready full-stack AI application** using:

* Python (FastAPI backend)
* LangGraph (agentic workflow orchestration)
* Supabase (authentication, database, storage)
* Gemini APIs (image + video generation)
* Modern frontend (angular preferred)

The system must be modular, scalable, and cleanly structured.

---

# 🎯 PROJECT GOAL

Build a platform where users can:

1. Enter a prompt OR configure options:

   * Style
   * Resolution
   * Aspect Ratio

2. Generate:

   * 🖼️ Images using `gemini-3.1-flash-image-preview`
   * 🎥 Videos using `veo-3.1-generate-001`

3. View history of generated content

4. Authenticate securely using Supabase

---

# 🏗️ SYSTEM ARCHITECTURE

Frontend (angular)
↓
Supabase Auth (JWT)
↓
FastAPI Backend
↓
LangGraph Agent Pipeline
↓
Gemini APIs
↓
Supabase Storage + Database

---

# ⚙️ TECH STACK

## Backend

* FastAPI
* LangGraph
* LangChain (optional)
* Python 3.10+

## Frontend

* angular (Vite)
* Tailwind CSS

## Auth & Storage

* Supabase

## AI Models

* Image: gemini-3.1-flash-image-preview
* Video: veo-3.1-generate-001

---

# 📁 BACKEND FOLDER STRUCTURE

backend/
│── app/
│   ├── main.py
│   ├── routes/
│   │   ├── generate.py
│   │   ├── history.py
│   ├── agents/
│   │   ├── prompt_agent.py
│   │   ├── style_agent.py
│   │   ├── parameter_agent.py
│   │   ├── safety_agent.py
│   │   ├── generator_agent.py
│   │   ├── evaluator_agent.py
│   ├── graph/
│   │   ├── workflow.py
│   ├── services/
│   │   ├── gemini_service.py
│   │   ├── supabase_service.py
│   ├── models/
│   │   ├── state.py
│   ├── utils/
│   │   ├── auth.py

---

# 🧠 LANGGRAPH STATE DESIGN

Use a TypedDict:

* prompt: str
* style: str
* resolution: str
* aspect_ratio: str
* enhanced_prompt: str
* final_prompt: str
* output_url: str
* type: "image" | "video"
* user_id: str

---

# 🤖 AGENT DEFINITIONS

## 1. Prompt Enhancer Agent

* Improve prompt quality using LLM
* Output: enhanced_prompt

## 2. Style Agent

* Append style to prompt
* Example:
  "cinematic lighting, 4k, digital art"

## 3. Parameter Agent

* Inject resolution and aspect ratio

## 4. Safety Agent

* Reject unsafe prompts
* Return error state if unsafe

## 5. Generator Agent

IF type == "image":
model = "gemini-3.1-flash-image-preview"

IF type == "video":
model = "veo-3.1-generate-001"

Return:

* output_url

## 6. Evaluator Agent

* Evaluate quality score
* Optionally retry generation if poor

---

# 🔁 LANGGRAPH WORKFLOW

Flow order:

prompt_agent
→ style_agent
→ parameter_agent
→ safety_agent
→ generator_agent
→ evaluator_agent

---

# ⚙️ FASTAPI ENDPOINTS

## 🔐 Auth

* Use Supabase JWT
* Validate token in middleware

---

## 🖼️ POST /api/generate/image

Request:
{
"prompt": "A futuristic city",
"style": "Digital Art",
"resolution": "1024x1024",
"aspect_ratio": "1:1"
}

---

## 🎥 POST /api/generate/video

Same structure but type = video

---

## 📜 GET /api/history

* Return user generation history

---

# 🔐 AUTH IMPLEMENTATION

* Use Supabase JWT
* Extract user_id from token
* Protect all routes

---

# 💾 DATABASE (Supabase)

Table: generations

Columns:

* id (uuid)
* user_id (text)
* prompt (text)
* style (text)
* resolution (text)
* aspect_ratio (text)
* type (text)
* output_url (text)
* created_at (timestamp)

---

# 🗂️ STORAGE

* Use Supabase Storage bucket: "generations"
* Store:

  * images/
  * videos/

---

# 🎨 FRONTEND REQUIREMENTS

## Components

1. Prompt Input

2. Style Selector (buttons)

   * Photorealistic
   * Digital Art
   * Anime
   * Oil Painting
   * 3D Render
   * Watercolor

3. Resolution Selector

4. Aspect Ratio Selector

5. Generate Button

---

# 💡 UI BEHAVIOR

* User can:

  * Only enter prompt
  * Only select options
  * OR both

* Backend must intelligently merge inputs

---

# 🔄 PROMPT FORMAT

Final prompt:

"{prompt}, {style}, resolution {resolution}, aspect ratio {aspect_ratio}, ultra detailed, high quality"

---

# ⚡ VIDEO HANDLING

* Use async processing
* Return job_id
* Provide status endpoint

---

# 🔥 ADVANCED FEATURES

* Multi-agent retry system
* Prompt memory (FAISS optional)
* Rate limiting
* Credit system

---

# ⚠️ CONSTRAINTS

* Do NOT build authentication manually
* MUST use Supabase Auth
* MUST use LangGraph (no linear pipeline)
* Code must be modular and production-ready

---

# ✅ OUTPUT REQUIREMENTS

Generate:

1. Full backend code (FastAPI + LangGraph)
2. Gemini API integration
3. Supabase integration
4. Frontend angular UI
5. Clean folder structure
6. README.md with setup steps

---

# 🧪 TESTING

* Include sample API calls
* Include mock responses if Gemini unavailable

---

# 🎯 FINAL GOAL

Deliver a working AI SaaS-like platform with:

* Agentic architecture
* Clean UI
* Scalable backend
* Secure authentication

---

END OF FILE
