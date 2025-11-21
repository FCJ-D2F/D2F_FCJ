/**
 * Alerts API Client
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function fetchWithAuth(url, options = {}) {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const headers = {
    "Content-Type": "application/json",
    ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export async function getAlerts(deviceId, severity, limit = 50) {
  const params = new URLSearchParams();
  if (deviceId) params.append("deviceId", deviceId);
  if (severity) params.append("severity", severity);
  params.append("limit", limit.toString());

  return fetchWithAuth(`${API_BASE_URL}/alerts?${params.toString()}`);
}

export async function getAlert(id) {
  return fetchWithAuth(`${API_BASE_URL}/alerts/${id}`);
}

export async function markAlertRead(id) {
  return fetchWithAuth(`${API_BASE_URL}/alerts/${id}/read`, {
    method: "PUT",
  });
}

export async function getAlertStats() {
  return fetchWithAuth(`${API_BASE_URL}/alerts/stats`);
}

