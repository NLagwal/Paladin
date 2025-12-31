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
