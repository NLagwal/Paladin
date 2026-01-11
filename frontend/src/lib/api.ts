
import axios from 'axios';
import { ActivityLog } from '@/types/dashboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AiStatus {
    status: string;
    mode: string;
    model: string;
    uptime: string;
}

export const api = {
    getAiStatus: async (): Promise<AiStatus> => {
        try {
            const res = await axios.get(`${API_BASE}/ai/status`);
            return res.data;
        } catch (error) {
            return { status: "OFFLINE", mode: "UNKNOWN", model: "-", uptime: "-" };
        }
    },

    getAiLogs: async (): Promise<ActivityLog[]> => {
        try {
            const res = await axios.get(`${API_BASE}/ai/logs`);
            return res.data;
        } catch (error) {
            return [];
        }
    },

    getTelemetry: async () => {
        try {
            const res = await axios.get(`${API_BASE}/telemetry`);
            return res.data;
        } catch (error) {
            return { cpu: 0, memory: 0, disk: 0, cpuTemp: 0 };
        }
    },

    getConfig: async (): Promise<AppConfig | null> => {
        try {
            const res = await axios.get(`${API_BASE}/ai/config`);
            return res.data;
        } catch (error) {
            return null;
        }
    },

    saveConfig: async (config: AppConfig): Promise<boolean> => {
        try {
            await axios.post(`${API_BASE}/ai/config`, config);
            return true;
        } catch (error) {
            return false;
        }
    }
};

export interface AppConfig {
    provider: string;
    api_key?: string;
    model: string;
    temperature: number;
    timeout_seconds: number;
    mode: "stable" | "experimental";
    ollama_base_url?: string;
}
