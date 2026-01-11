import axios from 'axios';
import { ActivityLog } from '../types/dashboard'; // Assuming types are here or similar
import { activityLog } from '../data/mockData';

// Safe access to environment variables
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
// We check for the string "true" because env vars are usually strings
const IS_DEMO = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

export interface AIStatus {
    status: 'running' | 'stopped' | 'error';
    uptime_seconds: number;
    active_model: string;
    mode: "stable" | "experimental";
}

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
