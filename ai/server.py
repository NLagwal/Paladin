from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api import run_once
from config import load_config, save_config, AppConfig
import datetime

# Load config to get mode
CONFIG = load_config()

app = FastAPI(title="Paladin Server")

# In-memory activity log (for demo purposes, real app would use DB)
ACTIVITY_LOGS = []

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

@app.get("/config")
def get_config():
    return CONFIG.dict()

@app.post("/config")
def update_config(new_config: AppConfig):
    try:
        # Save to file
        save_config(new_config)
        
        # Update in-memory config
        global CONFIG
        CONFIG = new_config
        
        return {"status": "updated", "config": CONFIG.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str
    command: str
    raw_output: str | None = None


@app.get("/health")
def health():
    return {"status": "healthy", "service": "paladin-ai"}

@app.get("/status")
def get_status():
    return {
        "status": "ONLINE",
        "mode": CONFIG.mode.upper(),
        "model": CONFIG.model,
        "uptime": "Active" # simplified
    }

@app.get("/logs")
def get_logs():
    # Return last 50 logs reversed
    return ACTIVITY_LOGS[::-1][:50]

def add_log(scope: str, message: str, level: str = "info"):
    log_entry = {
        "id": f"log-{len(ACTIVITY_LOGS) + 1}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%H:%M UTC"),
        "scope": scope,
        "message": message,
        "level": level
    }
    ACTIVITY_LOGS.append(log_entry)

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        if not req.message or not req.message.strip():
            return {
                "message": "[ERROR] Empty message received",
                "command": "",
                "raw_output": None,
            }
        
        # Log incoming request
        add_log("planner", f"Received request: {req.message}", "info")
        
        result = run_once(req.message.strip())
        
        # Log execution
        if result.get("command"):
            add_log("executor", f"Executed: `{result['command']}`", "success")
        else:
            add_log("planner", "No command generated", "warning")

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
        
        add_log("system", f"Error: {str(e)}", "error")
        
        return {
            "message": error_msg,
            "command": "",
            "raw_output": None,
        }
