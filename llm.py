from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama

from config import load_config


def get_llm() -> BaseChatModel:
    """
    Returns a configured LLM instance based on config.toml
    Currently supports Ollama only (MVP).
    """
    cfg = load_config()

    if cfg.provider == "ollama":
        return ChatOllama(
            model=cfg.model,
            temperature=cfg.temperature,
        )

    raise ValueError(f"Unsupported provider: {cfg.provider}")

