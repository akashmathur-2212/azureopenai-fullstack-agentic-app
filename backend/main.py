from fastapi import FastAPI
from contextlib import asynccontextmanager
from engine import setup_models
from endpoints import router
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup code on startup
    llm, embed_model = setup_models()
    app.state.llm = llm
    app.state.embed_model = embed_model

    yield

    # Teardown code on shutdown (optional)
    # e.g., app.state.llm.shutdown() if needed


app = FastAPI(lifespan=lifespan)
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
