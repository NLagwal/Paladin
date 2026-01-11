import axios from 'axios';
import { ActivityLog } from '../types/dashboard';
import { activityLog } from '../data/mockData';

// Safe access to environment variables
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
const IS_DEMO = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

// Match backend response: { status, mode, model, uptime }
export interface AiStatus {
    status: string;
    uptime: string;
    model: string;
    mode: string;
}

export type AIStatus = AiStatus; // Alias for backward compatibility if needed

export interface Telemetry {
    cpu_usage: number;
    memory_usage: number;
    cpu_temp: number;
}

export interface AppConfig {
    provider: string;
    api_key?: string;
    model: string;
    temperature: number;
    timeout_seconds: number;
    mode: "stable" | "experimental";
    ollama_base_url?: string;
}

export const api = {
    async getAiStatus(): Promise<AiStatus> {
        if (IS_DEMO) {
            return {
                status: 'ONLINE',
                uptime: '1h 23m',
                model: 'demo-model-v1',
                mode: 'stable'
            };
        }
        try {
            const response = await axios.get(`${API_URL}/ai/status`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch status:', error);
            return {
                status: 'OFFLINE',
                uptime: '-',
                model: '-',
                mode: '-'
            };
        }
    },

    async getAiLogs(): Promise<ActivityLog[]> {
        if (IS_DEMO) {
            return activityLog;
        }
        try {
            const response = await axios.get(`${API_URL}/ai/logs`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            return [];
        }
    },

    async getTelemetry(): Promise<Telemetry | null> {
        if (IS_DEMO) {
            return {
                cpu_usage: 20 + Math.random() * 10,
                memory_usage: 40 + Math.random() * 5,
                cpu_temp: 45 + Math.random() * 2
            };
        }
        try {
            const response = await axios.get(`${API_URL}/telemetry`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch telemetry:', error);
            return null;
        }
    },

    async getConfig(): Promise<AppConfig | null> {
        if (IS_DEMO) {
            return {
                provider: 'ollama',
                model: 'demo-model',
                temperature: 0.7,
                timeout_seconds: 30,
                mode: 'stable',
                ollama_base_url: 'http://localhost:11434'
            };
        }
        try {
            const response = await axios.get(`${API_URL}/ai/config`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch config:', error);
            return null;
        }
    },

    async saveConfig(config: AppConfig): Promise<boolean> {
        if (IS_DEMO) {
            console.log("Demo Mode: Configuration save simulated", config);
            return true;
        }
        try {
            await axios.post(`${API_URL}/ai/config`, config);
            return true;
        } catch (error) {
            console.error('Failed to save config:', error);
            return false;
        }
    },

    async getOllamaModels(): Promise<string[]> {
        if (IS_DEMO) {
            return ['llama3:latest', 'mistral:latest', 'gemma:2b', 'demo-model-v1'];
        }
        try {
            const response = await axios.get(`${API_URL}/ai/ollama/models`);
            return response.data.models || [];
        } catch (error) {
            console.error('Failed to fetch Ollama models:', error);
            return [];
        }
    }
};

