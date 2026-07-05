from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, documents, search
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MemoryVerse API",
    description="AI-powered Digital Identity System",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "MemoryVerse API is running"}
