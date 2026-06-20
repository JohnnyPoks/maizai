export type LogLevel = 'info' | 'warn' | 'error';

export interface AppLogEntry {
  id: string;
  at: string;
  level: LogLevel;
  tag: string;
  message: string;
}

export interface HttpLogEntry {
  id: string;
  at: string;
  method: string;
  url: string;
  requestBody?: string;
  statusCode?: number;
  responseBody?: string;
  durationMs?: number;
  error?: string;
}

const MAX = 300;

class DebugStore {
  private appLogs: AppLogEntry[] = [];
  private httpLogs: HttpLogEntry[] = [];
  private listeners = new Set<() => void>();

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  log(level: LogLevel, tag: string, message: string) {
    if (this.appLogs.length >= MAX) this.appLogs.shift();
    this.appLogs.push({
      id: Math.random().toString(36).slice(2),
      at: new Date().toISOString(),
      level,
      tag,
      message,
    });
    this.notify();
  }

  addRequest(method: string, url: string, body?: unknown): string {
    const id = Math.random().toString(36).slice(2);
    if (this.httpLogs.length >= MAX) this.httpLogs.shift();
    this.httpLogs.push({
      id,
      at: new Date().toISOString(),
      method,
      url,
      requestBody: body != null ? JSON.stringify(body).slice(0, 500) : undefined,
    });
    this.notify();
    return id;
  }

  updateRequest(id: string, patch: Partial<Pick<HttpLogEntry, 'statusCode' | 'responseBody' | 'durationMs' | 'error'>>) {
    const i = this.httpLogs.findIndex((e) => e.id === id);
    if (i !== -1) {
      this.httpLogs[i] = { ...this.httpLogs[i], ...patch };
      this.notify();
    }
  }

  getAppLogs = (): AppLogEntry[] => [...this.appLogs].reverse();
  getHttpLogs = (): HttpLogEntry[] => [...this.httpLogs].reverse();

  clearAppLogs = () => { this.appLogs = []; this.notify(); };
  clearHttpLogs = () => { this.httpLogs = []; this.notify(); };

  exportAll(): string {
    const app = this.appLogs
      .map((e) => `[${e.at}] [${e.level.toUpperCase()}] ${e.tag}: ${e.message}`)
      .join('\n');
    const http = this.httpLogs
      .map((e) => `[${e.at}] ${e.method} ${e.url} → ${e.statusCode ?? 'ERR'} (${e.durationMs ?? '?'}ms)`)
      .join('\n');
    return `=== APP LOGS ===\n${app}\n\n=== HTTP LOGS ===\n${http}`;
  }
}

export const debugStore = new DebugStore();

export function dlog(tag: string, message: string) {
  if (__DEV__) {
    console.warn(`[${tag}] ${message}`);
    debugStore.log('info', tag, message);
  }
}

export function dlogWarn(tag: string, message: string) {
  if (__DEV__) {
    console.warn(`[${tag}] ${message}`);
    debugStore.log('warn', tag, message);
  }
}

export function dlogError(tag: string, message: string) {
  if (__DEV__) {
    console.error(`[${tag}] ${message}`);
    debugStore.log('error', tag, message);
  }
}
