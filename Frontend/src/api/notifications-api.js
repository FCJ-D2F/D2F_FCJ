/**
 * Notifications API Client
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

export async function getPreferences() {
  return fetchWithAuth(`${API_BASE_URL}/notifications/preferences`);
}

export async function updatePreferences(preferences) {
  return fetchWithAuth(`${API_BASE_URL}/notifications/preferences`, {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}

export async function sendTestNotification() {
  return fetchWithAuth(`${API_BASE_URL}/notifications/test`, {
    method: "POST",
  });
}

