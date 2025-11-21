/**
 * Reports API Client
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

export async function listReports() {
  return fetchWithAuth(`${API_BASE_URL}/reports`);
}

export async function downloadReport(id) {
  return fetchWithAuth(`${API_BASE_URL}/reports/${id}/download`);
}

export async function generateReport(deviceId, startTime, endTime, type = "summary") {
  return fetchWithAuth(`${API_BASE_URL}/reports/generate`, {
    method: "POST",
    body: JSON.stringify({ deviceId, startTime, endTime, type }),
  });
}

export async function deleteReport(id) {
  return fetchWithAuth(`${API_BASE_URL}/reports/${id}`, {
    method: "DELETE",
  });
}

