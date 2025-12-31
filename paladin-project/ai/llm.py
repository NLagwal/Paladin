import os
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama

from config import load_config


def get_llm() -> BaseChatModel:
    """
    Returns a configured LLM instance based on config.toml
    Currently supports Ollama only (MVP).
    """
    cfg = load_config()
    ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

    if cfg.provider == "ollama":
        return ChatOllama(
            base_url=ollama_base_url,
            model=cfg.model,
            temperature=cfg.temperature,
        )

    raise ValueError(f"Unsupported provider: {cfg.provider}")

