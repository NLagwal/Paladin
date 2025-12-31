import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';
import React from "react";

/**
 * Merges class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const getSeverityColor = (severity: "critical" | "high" | "medium" | "low") => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/5';
      case 'high': return 'border-orange-500/50 bg-orange-500/5';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
      default: return 'border-zinc-500/50 bg-zinc-500/5';
    }
};

export const getIntentColor = (intent: "ok" | "warn" | "error" | undefined) => {
    switch (intent) {
      case 'warn': return 'text-orange-400';
      case 'error': return 'text-red-400';
      default: return 'text-emerald-400';
    }
};

export const getLevelIcon = (level: "info" | "success" | "warning" | "error") => {
    switch (level) {
      case 'success': return React.createElement(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-400" });
      case 'warning': return React.createElement(AlertTriangle, { className: "w-3.5 h-3.5 text-orange-400" });
      case 'error': return React.createElement(X, { className: "w-3.5 h-3.5 text-red-400" });
      default: return React.createElement(Info, { className: "w-3.5 h-3.5 text-blue-400" });
    }
};