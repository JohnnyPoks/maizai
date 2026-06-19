import AsyncStorage from "@react-native-async-storage/async-storage";
import { client, getDefaultBaseUrl, updateApiBaseUrl } from "./api";
import { debugStore } from "./debug-store";

const URL_KEY = "@maizai:debug:apiUrl";

export async function loadDebugApiUrl(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(URL_KEY);
    if (saved) updateApiBaseUrl(saved);
  } catch {}
}

export async function saveDebugApiUrl(url: string | null): Promise<void> {
  if (url) {
    await AsyncStorage.setItem(URL_KEY, url);
    updateApiBaseUrl(url);
  } else {
    await AsyncStorage.removeItem(URL_KEY);
    updateApiBaseUrl(getDefaultBaseUrl());
  }
}

export async function getDebugApiUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(URL_KEY);
  } catch {
    return null;
  }
}

let interceptorAttached = false;

export function attachDebugInterceptor(): void {
  if (interceptorAttached) return;
  interceptorAttached = true;

  client.interceptors.request.use(
    (config) => {
      const id = debugStore.addRequest(
        config.method?.toUpperCase() ?? "GET",
        (config.baseURL ?? "") + (config.url ?? ""),
        config.data,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any)._debugId = id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any)._debugStart = Date.now();
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cfg = response.config as any;
      if (cfg._debugId) {
        debugStore.updateRequest(cfg._debugId, {
          statusCode: response.status,
          responseBody: JSON.stringify(response.data).slice(0, 500),
          durationMs: cfg._debugStart ? Date.now() - cfg._debugStart : undefined,
        });
      }
      return response;
    },
    (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cfg = error.config as any;
      if (cfg?._debugId) {
        debugStore.updateRequest(cfg._debugId, {
          statusCode: error.response?.status,
          error: `${error.code ?? "ERR"}: ${error.message}`,
          durationMs: cfg._debugStart ? Date.now() - cfg._debugStart : undefined,
        });
      }
      return Promise.reject(error);
    },
  );
}
