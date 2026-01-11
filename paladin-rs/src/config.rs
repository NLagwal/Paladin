use serde::Deserialize;
use std::fs;
use anyhow::{Context, Result};

#[derive(Debug, Deserialize, Clone)]
pub struct AppConfig {
    pub provider: String,
    pub api_key: Option<String>,
    pub model: String,
    pub temperature: f32,
    pub timeout_seconds: u64,
    pub mode: String, // "stable" or "experimental"
    #[serde(default)]
    pub allowed_commands: Vec<String>,
    #[serde(default)]
    pub tools: Vec<String>,
}

pub fn load_config(path: &str) -> Result<AppConfig> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read config file at {}", path))?;
    
    let config: AppConfig = toml::from_str(&content)
        .context("Failed to parse config.toml")?;

    Ok(config)
}
