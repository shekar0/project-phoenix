"""Project Phoenix - FastAPI Application Entry Point."""

from dotenv import load_dotenv

# Load environment variables BEFORE anything else
load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize app
app = FastAPI(
    title="Project Phoenix — AI Generation Platform",
    description="Agentic AI Image & Video Generation Platform powered by Gemini and LangGraph",
    version="1.0.0",
)

# ✅ CORS Middleware (MUST be before routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:5173",
        "https://project-phoenix-vcs.vercel.app",
        "https://project-phoenix-fo1o.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Handle preflight requests explicitly (important for Render edge cases)
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"message": "OK"}

# Import routers AFTER middleware
from app.routes import generate, history

# ✅ Add /api prefix (VERY IMPORTANT)
app.include_router(generate.router, prefix="/api")
app.include_router(history.router, prefix="/api")

# Health routes
@app.get("/", tags=["health"])
async def root():
    return {
        "message": "Project Phoenix API is running",
        "version": "1.0.0"
    }

@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}
