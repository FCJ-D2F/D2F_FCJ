/**
 * Devices API Client
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

export async function getDevices() {
  return fetchWithAuth(`${API_BASE_URL}/devices`);
}

export async function getDevice(id) {
  return fetchWithAuth(`${API_BASE_URL}/devices/${id}`);
}

export async function getDeviceHistory(id, startTime, endTime, limit = 100) {
  const params = new URLSearchParams();
  if (startTime) params.append("startTime", startTime);
  if (endTime) params.append("endTime", endTime);
  params.append("limit", limit.toString());

  return fetchWithAuth(`${API_BASE_URL}/devices/${id}/history?${params.toString()}`);
}

export async function sendDeviceCommand(id, command, value) {
  return fetchWithAuth(`${API_BASE_URL}/devices/${id}/command`, {
    method: "POST",
    body: JSON.stringify({ command, value }),
  });
}

