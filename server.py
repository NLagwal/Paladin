from fastapi import FastAPI
from pydantic import BaseModel
from api import run_once

app = FastAPI(title="Paladin Server")

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str
    command: str
    raw_output: str | None = None


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    result = run_once(req.message)

    return {
        "message": result["message"],
        "command": result["command"],
        "raw_output": result["raw_output"],
    }
