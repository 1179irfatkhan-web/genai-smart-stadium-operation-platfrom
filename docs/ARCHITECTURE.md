# System Architecture

StadiumIQ is a server-split decision-support platform designed to handle smart stadium telemetry during the FIFA World Cup 2026. The solution leverages React on the frontend and Supabase (PostgreSQL, Auth, Edge Functions) with Google Gemini AI on the backend.

---

## 🗺️ System Topology

```mermaid
flowchart TB
    subgraph Client["Client (React + TypeScript)"]
        UI["UI (Dashboard / Maps / AI Assistant)"]
        Val["Client Input Validation & Sanitization"]
        Inj["Client Prompt Injection Detection"]
        RL["Client Rate Limiter (3s memory)"]
        Cache["Client LRU AI Cache (50 entries)"]
        Ground["Client Grounding Check"]
    end

    subgraph Edge["Supabase Edge Function (Deno Runtime)"]
        Auth["Bearer Header & JWT Verification"]
        Service["Service Client Initialization"]
        Role["Server-side Role Query (Zero-trust)"]
        SVal["Server-side Sanitization"]
        SInj["Server-side Injection Filter"]
        Context["Context Builder (Grounded Data)"]
        Rate["Atomic Rate Limiter (FOR UPDATE Locking)"]
        Gemini["Google Gemini 1.5 Flash API"]
    end

    subgraph DB["Supabase Database (PostgreSQL)"]
        DBR["auth.users (Registry)"]
        RLT["rate_limits (Durable Records)"]
        GAT["gates / seating / transport / alerts (Context tables)"]
    end

    subgraph Google["External GenAI Endpoint"]
        GEM["gemini-1.5-flash:generateContent"]
    end

    User((User)) --> UI
    UI --> Val --> Inj --> RL --> Cache --> Ground
    Ground -->|grounded query + token| Edge
    Edge --> Auth --> Service --> Role
    Role --> DBR
    Role --> Rate
    Rate --> RLT
    Rate --> Context
    Context --> GAT
    Context --> Gemini
    Gemini -->|GEMINI_API_KEY| GEM
    GEM -->|JSON Response| Edge
    Edge -->|StructuredAIResponse| UI
    UI --> User
```

---

## 🔄 Client-to-Edge Request Sequence

The sequence diagram below shows the end-to-end request path of an assistant query. It highlights zero-trust authorization (bypassing client-supplied roles) and database row locking during rate checks.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (aiLogic.ts)
    participant E as Edge Function (stadium-ai)
    participant DB as Supabase PostgreSQL
    participant G as Google Gemini API

    U->>C: Input question (query)
    C->>C: Enforce size limit (<1000 chars) & HTML sanitize
    C->>C: Detect prompt injection (12 regex patterns)
    C->>C: Check client-side cooldown (3s memory)
    C->>C: Search LRU cache (50 entries)
    C->>C: Grounding check (isQueryGrounded)
    C->>E: POST /functions/v1/stadium-ai (Bearer JWT)
    
    Note over E: Edge Function parses token
    E->>E: Enforce HTTP method restriction (POST, OPTIONS only)
    E->>E: Verify Bearer token signature (auth.getUser)
    E->>E: Initialize service role client (SUPABASE_SERVICE_ROLE_KEY)
    
    Note over E: Zero-trust Role Lookup
    E->>DB: SELECT role FROM profiles WHERE id = user_id
    DB-->>E: real role (e.g. venue_staff)
    
    Note over E: Atomic Rate Limiting
    E->>DB: RPC check_and_update_rate_limit(user_id, '3 seconds')
    Note over DB: Lock row (FOR UPDATE) & check cooldown
    DB-->>E: allowed=true, retry_after=0
    
    Note over E: Authoritative Context Fetching
    E->>DB: Fetch tables (gates, seats, crowd, transport, etc.)
    DB-->>E: complete telemetry records
    
    E->>E: Build prompt with system instructions
    E->>G: POST /v1beta/models/gemini-1.5-flash:generateContent
    G-->>E: Valid JSON payload
    
    E->>E: Validate structured JSON format
    E-->>C: 200 OK (StructuredAIResponse)
    C->>C: Store in LRU cache
    C-->>U: Display response (answer, confidence, actions, sources)
```

---

## 🔑 Authentication & Authorization (Zero-Trust)

### Authenticated Token Extraction
Client requests must include the user's Supabase session JWT in the `Authorization` header under the `Bearer <token>` scheme. The Edge Function verifies this token cryptographically on Supabase Auth. Any missing, malformed, or invalid tokens are rejected with `401 Unauthorized`.

### Server-Side Role Enforcement
The application implements a zero-trust model for user roles. The client-supplied role parameter in the request body is **completely ignored** for authorization. The Edge Function uses the `SUPABASE_SERVICE_ROLE_KEY` to query the authenticated user's real role from the database `profiles` table. This role (e.g., `fan`, `volunteer`, `venue_staff`, `organizer`) is then used to construct the system prompt.

---

## 🚦 Server-Side Atomic Rate Limiting

Rate limiting is verified at the database level using a PostgreSQL-stored function `check_and_update_rate_limit`. 
1. **Row Locking**: When a request arrives, the function locks the user's rate record (`SELECT ... FOR UPDATE`), preventing concurrent requests from bypassing the check.
2. **Atomic Comparison**: The difference between the current time and the locked `last_request_at` timestamp is evaluated. If it is less than the 3-second cooldown interval, the request is rejected.
3. **Transaction Commit**: If allowed, the timestamp is updated to the current time, and the row lock is released upon transaction commit.
4. **Fallback Strategy**: In environments where the RPC function is not present, the Edge Function falls back gracefully to a standard select-then-upsert query to maintain service continuity.

---

## 🌐 CORS & HTTP Restriction

- **Allowed Methods**: Restricted strictly to `POST` and `OPTIONS` (preflight). All other HTTP verbs are rejected with `450 Method Not Allowed` or `405 Method Not Allowed` headers.
- **Trusted Origins**: The `Access-Control-Allow-Origin` header is mapped to the configured origins stored in the server-side `ALLOWED_ORIGINS` environment variables. 
- **Developer Support**: Dynamic local development support is maintained by verifying that the origin headers match the regex `^https?://localhost(:\d+)?$`. If the origin is untrusted, a safe fallback origin is returned.
