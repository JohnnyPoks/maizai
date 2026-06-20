import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "./auth";
import type {
  MobileSignInRequest,
  MobileSignInResponse,
  SyncImageRequest,
  SyncImageResponse,
  SyncClassificationRequest,
  SyncClassificationResponse,
  ApiRuleThreshold,
  AccessRequestBody,
} from "@/types/api";

// Resolution order: app.json extra.apiUrl → EXPO_PUBLIC_API_URL (set per EAS
// profile) → the production cloud back-end. The debug screen can override this
// at runtime (e.g. a Cloudflare tunnel) without rebuilding the APK.
const DEFAULT_BASE_URL =
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://maizai.vercel.app";

export const client = axios.create({ baseURL: DEFAULT_BASE_URL, timeout: 15_000 });

export const getDefaultBaseUrl = () => DEFAULT_BASE_URL;

export function updateApiBaseUrl(url: string) {
  client.defaults.baseURL = url;
}

// Attach Bearer token to every request when available
client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  async signIn(body: MobileSignInRequest): Promise<MobileSignInResponse> {
    const { data } = await client.post<MobileSignInResponse>("/api/auth/mobile-signin", body);
    return data;
  },

  async requestAccess(body: AccessRequestBody): Promise<{ id: string }> {
    const { data } = await client.post<{ id: string }>("/api/access-requests", body);
    return data;
  },

  // currentPassword is required for a voluntary change; omit it for the forced
  // first-login change (the server only requires newPassword in that case).
  async changePassword(newPassword: string, currentPassword?: string): Promise<void> {
    const body = currentPassword ? { currentPassword, newPassword } : { newPassword };
    await client.post("/api/users/me/password", body);
  },

  async submitFeedback(body: {
    type: "BUG" | "SUGGESTION";
    message: string;
    appVersion?: string;
    device?: string;
  }): Promise<void> {
    await client.post("/api/feedback", body);
  },

  async syncImage(body: SyncImageRequest): Promise<SyncImageResponse> {
    const { data } = await client.post<SyncImageResponse>("/api/sync/images", body);
    return data;
  },

  async syncClassification(body: SyncClassificationRequest): Promise<SyncClassificationResponse> {
    const { data } = await client.post<SyncClassificationResponse>("/api/sync/classifications", body);
    return data;
  },

  async fetchThresholds(): Promise<ApiRuleThreshold[]> {
    const { data } = await client.get<ApiRuleThreshold[]>("/api/thresholds");
    return data;
  },

  async getMe(): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const { data } = await client.get("/api/users/me");
    return data;
  },
};
