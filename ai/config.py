from typing import Optional
from pydantic import BaseModel, Field, ValidationError
import tomllib
import sys

class AppConfig(BaseModel):
    provider: str = Field(..., description="LLM provider name")
    api_key: Optional[str] = Field(None, description="API Key for cloud providers")
    model: str = Field(..., description="Model identifier")
    temperature: float = Field(..., ge=0.0, le=1.0)
    timeout_seconds: int = Field(..., gt=0)

    mode: str = Field(
        ...,
        pattern="^(stable|experimental)$",
        description="Execution mode"
    )
    ollama_base_url: str = Field("http://127.0.0.1:11434", description="Base URL for Ollama")
    allowed_commands: Optional[list[str]] = Field(default_factory=list, description="List of allowed commands in stable mode")
    tools: Optional[list[str]] = Field(default_factory=list, description="List of enabled tools")

    class Config:
        extra = "forbid"


def load_config(path: str = "config.toml") -> AppConfig:
    try:
        with open(path, "rb") as f:
            raw = tomllib.load(f)
        return AppConfig(**raw)

    except FileNotFoundError:
        print(f"Config file not found: {path}")
        sys.exit(1)

    except ValidationError as e:
        print("Invalid configuration:")
        print(e)
        sys.exit(1)


def save_config(config: AppConfig, path: str = "config.toml"):
    lines = []
    lines.append(f'provider = "{config.provider}"')
    if config.api_key:
        lines.append(f'api_key = "{config.api_key}"')
    else:
        pass
        
    lines.append(f'model = "{config.model}"')
    lines.append(f'temperature = {config.temperature}')
    lines.append(f'timeout_seconds = {config.timeout_seconds}')
    lines.append(f'mode = "{config.mode}"')
    lines.append(f'ollama_base_url = "{config.ollama_base_url}"')
    
    def fmt_list(l):
        if not l: return "[]"
        return "[" + ", ".join(f'"{x}"' for x in l) + "]"

    if config.allowed_commands is not None:
         lines.append(f'allowed_commands = {fmt_list(config.allowed_commands)}')
    
    if config.tools is not None:
         lines.append(f'tools = {fmt_list(config.tools)}')

    with open(path, "w") as f:
        f.write("\n".join(lines) + "\n")
