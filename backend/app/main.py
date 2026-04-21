"""Project Phoenix - FastAPI Application Entry Point."""

from dotenv import load_dotenv

# Load environment variables BEFORE any other app imports
# so that services can read config when they initialize.
load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import generate, history

app = FastAPI(
    title="Project Phoenix — AI Generation Platform",
    description="Agentic AI Image & Video Generation Platform powered by Gemini and LangGraph",
    version="1.0.0",
)

# CORS — allow the Angular dev server and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:5173",
        "https://project-phoenix-fo1o.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(generate.router)
app.include_router(history.router)


@app.get("/", tags=["health"])
async def root():
    return {"message": "Project Phoenix API is running", "version": "1.0.0"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}
