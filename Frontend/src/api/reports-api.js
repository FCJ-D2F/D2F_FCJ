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

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let message = "Request failed";
    try {
      if (contentType.includes("application/json")) {
        const error = await response.json();
        message = error.error || error.message || message;
      } else {
        const text = await response.text();
        message = text || message;
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  // For non-JSON success responses (not expected here, but just in case)
  return { success: true };
}

export async function listReports() {
  return fetchWithAuth(`${API_BASE_URL}/reports`);
}

export async function downloadReport(id) {
  // id is an S3 key and may contain '/', so we must URL-encode it
  const encodedId = encodeURIComponent(id);
  return fetchWithAuth(`${API_BASE_URL}/reports/${encodedId}/download`);
}

export async function generateReport(deviceId, startTime, endTime, type = "summary") {
  return fetchWithAuth(`${API_BASE_URL}/reports/generate`, {
    method: "POST",
    body: JSON.stringify({ deviceId, startTime, endTime, type }),
  });
}

export async function deleteReport(id) {
  const encodedId = encodeURIComponent(id);
  return fetchWithAuth(`${API_BASE_URL}/reports/${encodedId}`, {
    method: "DELETE",
  });
}

