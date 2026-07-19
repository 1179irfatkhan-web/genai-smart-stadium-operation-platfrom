# Security Architecture and Manual

StadiumIQ implements multi-layered security controls to protect the application frontend, PostgreSQL database, and Google Gemini AI integration.

---

## 🔐 Token-Based Authentication

All operations in the `stadium-ai` Supabase Edge Function are authenticated:
1. **Bearer Scheme Enforcement**: Requests must supply an `Authorization` header formatted strictly as `Bearer <JWT_TOKEN>`.
2. **Cryptographic Signature Verification**: The Edge Function extracts the token and calls `supabaseClient.auth.getUser(token)` to verify the signature cryptographically against Supabase Auth.
3. **Invalid Header / Session Handling**: Missing or malformed authentication headers, expired signatures, or invalid session IDs are blocked with a `401 Unauthorized` status.

---

## 🛡️ Zero-Trust Authorization (Real Roles)

To prevent client-side role tampering or escalation:
1. **Client Role Exclusion**: The `role` string passed in the client's request body is **ignored** for database authorization and prompt building.
2. **Authoritative Server Query**: The Edge Function initializes a service client using the `SUPABASE_SERVICE_ROLE_KEY`. It fetches the user's authentic role directly from the `profiles` table:
   ```sql
   SELECT role FROM profiles WHERE id = user_id;
   ```
3. **Row-Level Security (RLS)**: The profiles table is locked down using PostgreSQL Row-Level Security policies. Users can read only their own profile records, while role modification is restricted to administrative keys.

---

## 🚦 Atomic Durable Rate Limiting

To prevent race conditions (such as concurrent batch queries bypassing the rate limit):
1. **Durable Database Registry**: Rate logs are recorded in the `rate_limits` table with timestamps.
2. **Row locking (`FOR UPDATE`)**: The check queries use the `check_and_update_rate_limit` stored procedure, which locks the user's rate record:
   ```sql
   SELECT last_request_at FROM rate_limits WHERE user_id = p_user_id FOR UPDATE;
   ```
   This serializes incoming requests from the same user, preventing concurrent bypassing attempts.
3. **Atomic Cooldown Evaluation**: If the time difference between requests is less than the 3-second cooldown interval, the transaction returns allowed=false and blocks the update.
4. **Graceful Fallback**: If the stored procedure is missing, the code falls back to standard database select-then-upsert logic to ensure service continuity.

---

## 🌐 CORS and HTTP Method Restriction

The Edge Function restricts origin and method access:
1. **HTTP Method Lockdown**: Only `POST` (for querying) and `OPTIONS` (for CORS preflight) requests are allowed. Other methods are rejected with `405 Method Not Allowed`.
2. **Allowed Origins**: The `Access-Control-Allow-Origin` header is matched against the origins configured in the server-side `ALLOWED_ORIGINS` environment variables.
3. **Localhost Development**: Local development support matches the regex pattern `^https?://localhost(:\d+)?$`. If the origin is untrusted, the CORS filter returns a safe fallback origin.

---

## 🧬 Input Validation, Sanitization, and Injection Protection

1. **Length Enforcement**: Queries are validated client-side and truncated server-side to a maximum of 1000 characters.
2. **HTML Entity Encoding**: User query characters are sanitized to encode potential HTML injections.
3. **Prompt Injection Detection**: The query is matched against 12 regular expression patterns on both the client and server:
   - Matches phrases like `"ignore previous instructions"`, `"reveal system prompt"`, `"you are now acting as"`, etc.
   - Matches SQL commands (`DROP`, `DELETE`, `INSERT`, `UPDATE`, etc.) to prevent database scripting attempts.
   - Rejects matched requests immediately, returning a security warning response without invoking the Gemini API.

---

## 🔑 Safe Errors & Secrets Confinement

1. **Secret Containment**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are configured strictly inside the Supabase Vault/Edge Secrets. They are never exposed to build assets, client logs, or API responses.
2. **Safe Error Mapping**: The Edge Function catch blocks return generic messages on any error, omitting stack traces, internal database table structures, or system variables.
