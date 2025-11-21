/**
 * Helper function for making authenticated API calls
 * This is a placeholder - actual implementation depends on your auth setup
 */
export async function fetchJson(url: string, opts: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

