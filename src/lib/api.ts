const BASE = "/api";

function authHeader(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeader() });
  return handle<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: FormData | object,
): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: isForm
      ? authHeader()
      : { "content-type": "application/json", ...authHeader() },
    body: isForm ? body : JSON.stringify(body),
  });
  return handle<T>(res);
}

export async function apiPatch<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}
