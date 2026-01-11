import os
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI

from config import load_config


def get_llm() -> BaseChatModel:
    """
    Returns a configured LLM instance based on config.toml
    Currently supports Ollama and Gemini.
    """
    cfg = load_config()
    # Prioritize config file, allow env var override if config is default? 
    # Actually, config file should be source of truth if we are editing it via UI.
    ollama_base_url = cfg.ollama_base_url or os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

    if cfg.provider == "ollama":
        return ChatOllama(
            base_url=ollama_base_url,
            model=cfg.model,
            temperature=cfg.temperature,
        )
    
    if cfg.provider == "gemini":
        if not cfg.api_key:
            raise ValueError("API key is required for Gemini provider")
            
        return ChatGoogleGenerativeAI(
            model=cfg.model,
            temperature=cfg.temperature,
            google_api_key=cfg.api_key
        )

    raise ValueError(f"Unsupported provider: {cfg.provider}")

