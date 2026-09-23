export class ApiError extends Error {}

async function request<T>(url: string, opt: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin", ...opt });
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. empty response)
  }
  if (!res.ok) {
    const detail = (data as { detail?: string })?.detail;
    throw new ApiError(detail || `Request failed (${res.status})`);
  }
  return data as T;
}

export function apiGet<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join("&")
    : "";
  return request<T>(path + qs);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiUpload<T>(path: string, file: File): Promise<T> {
  const fd = new FormData();
  fd.append("file", file);
  return request<T>(path, { method: "POST", body: fd });
}

/** Downloads a file response (Excel/PDF) and triggers a browser save. */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.detail || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1200);
}
