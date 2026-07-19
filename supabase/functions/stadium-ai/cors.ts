interface DenoEnv {
  get(key: string): string | undefined;
}
interface DenoNamespace {
  env: DenoEnv;
}
declare const Deno: DenoNamespace;

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  
  // Local development support: allow localhost with any port
  const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
  
  // Production allowed origins from environment variable
  const allowedOriginsStr = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const allowedOrigins = allowedOriginsStr
    ? allowedOriginsStr.split(",").map((o: string) => o.trim()).filter(Boolean)
    : [];

  // Default fallback production origin if no origin matches
  const defaultOrigin = allowedOrigins[0] ?? "https://stadiumiq.com";

  // Check if requested origin is trusted
  const isTrusted = isLocalhost || allowedOrigins.includes(origin) || origin.endsWith(".stadiumiq.com");
  
  const allowedOrigin = isTrusted ? origin : defaultOrigin;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
