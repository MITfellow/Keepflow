export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return true;

  try {
    const requestHost = request.headers.get("host");
    if (!requestHost) return false;

    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

export function hasJsonContentType(request: Request): boolean {
  return (request.headers.get("content-type") ?? "")
    .toLowerCase()
    .includes("application/json");
}

export function noStoreJson(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json(body, { ...init, headers });
}
