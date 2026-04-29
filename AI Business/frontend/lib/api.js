const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("abw_token");
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("abw_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("abw_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function download(path) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method: "GET", headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.message || "Download failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || "download.zip";
  return { blob, filename };
}

async function requestText(path, { auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { method: "GET", headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.message || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return await res.text();
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  verifyLogin: (payload) => request("/auth/verify-login", { method: "POST", body: payload, auth: false }),
  resendLoginOtp: (payload) => request("/auth/resend-login-otp", { method: "POST", body: payload, auth: false }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload, auth: false }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload, auth: false }),
  getUsage: () => request("/usage"),
  generateFromPrompt: (payload) => {
    if (typeof payload === "string") return request("/generate-from-prompt", { method: "POST", body: { prompt: payload } });
    return request("/generate-from-prompt", { method: "POST", body: payload });
  },
  createWebsite: (payload) => request("/websites", { method: "POST", body: payload }),
  updateWebsite: (id, patch) => request(`/websites/${id}`, { method: "PATCH", body: patch }),
  listWebsites: () => request("/websites"),
  getWebsite: (id) => request(`/websites/${id}`),
  publishWebsite: (id, payload) => request(`/websites/${id}/publish`, { method: "POST", body: payload }),
  getWebsiteByDomain: (domain) => request(`/websites/by-domain?domain=${encodeURIComponent(domain)}`, { auth: false }),
  exportWebsite: (id) => download(`/websites/${id}/export`),
  exportWebsiteHtml: (id) => requestText(`/websites/${id}/export?format=html`),
  exportWebsiteJson: (id) => request(`/websites/${id}/export?format=json`),
  regenerateWebsite: (id) => request(`/websites/${id}/regenerate`, { method: "POST", body: {} }),
  createOrder: (payload) => request("/create-order", { method: "POST", body: payload }),
  verifyPayment: (payload) => request("/verify-payment", { method: "POST", body: payload }),
  getAnalytics: () => request("/analytics/overview")
};

