from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api import run_once

app = FastAPI(title="Paladin Server")

# CORS middleware - allow API Gateway to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str
    command: str
    raw_output: str | None = None


@app.get("/health")
def health():
    return {"status": "healthy", "service": "paladin-ai"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        if not req.message or not req.message.strip():
            return {
                "message": "[ERROR] Empty message received",
                "command": "",
                "raw_output": None,
            }
        
        result = run_once(req.message.strip())
        
        # Ensure we always return valid data
        return {
            "message": result.get("message", "[INFO] Command processed"),
            "command": result.get("command", ""),
            "raw_output": result.get("raw_output", ""),
        }
    except Exception as e:
        import traceback
        error_msg = f"[ERROR] {type(e).__name__}: {str(e)}"
        print(f"Error in chat endpoint: {error_msg}")
        print(traceback.format_exc())
        
        return {
            "message": error_msg,
            "command": "",
            "raw_output": None,
        }
