use crate::config::AppConfig;
use anyhow::{Result, bail};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Clone)]
pub enum Provider {
    Ollama,
    Gemini,
}

pub struct LLMClient {
    provider: Provider,
    model: String,
    temperature: f32,
    api_key: Option<String>,
    client: reqwest::Client,
}

impl LLMClient {
    pub fn new(config: &AppConfig) -> Result<Self> {
        let provider = match config.provider.as_str() {
            "ollama" => Provider::Ollama,
            "gemini" => Provider::Gemini,
            _ => bail!("Unsupported provider: {}", config.provider),
        };

        if matches!(provider, Provider::Gemini) && config.api_key.is_none() {
            bail!("API key required for Gemini");
        }

        Ok(Self {
            provider,
            model: config.model.clone(),
            temperature: config.temperature,
            api_key: config.api_key.clone(),
            client: reqwest::Client::new(),
        })
    }

    pub async fn invoke(&self, prompt: &str) -> Result<String> {
        match self.provider {
            Provider::Ollama => self.invoke_ollama(prompt).await,
            Provider::Gemini => self.invoke_gemini(prompt).await,
        }
    }

    async fn invoke_ollama(&self, prompt: &str) -> Result<String> {
        let url = "http://localhost:11434/api/generate";
        let body = json!({
            "model": self.model,
            "prompt": prompt,
            "stream": false,
            "options": {
                "temperature": self.temperature
            }
        });

        let res = self.client.post(url)
            .json(&body)
            .send()
            .await?;
            
        if !res.status().is_success() {
             bail!("Ollama error: {}", res.status());
        }

        let resp_json: serde_json::Value = res.json().await?;
        Ok(resp_json["response"].as_str().unwrap_or("").to_string())
    }

    async fn invoke_gemini(&self, prompt: &str) -> Result<String> {
        let key = self.api_key.as_ref().unwrap();
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            self.model, key
        );
        
        let body = json!({
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": self.temperature
            }
        });

        let res = self.client.post(&url)
            .json(&body)
            .send()
            .await?;

        if !res.status().is_success() {
             bail!("Gemini error: {}", res.status());
        }

        let resp_json: serde_json::Value = res.json().await?;
        
        // Extract text from Gemini response structure
        // candidates[0].content.parts[0].text
        let text = resp_json["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .unwrap_or("")
            .to_string();
            
        Ok(text)
    }
}
