import { createClient, SupabaseClient, User } from "npm:@supabase/supabase-js@2.45.4";

declare const Deno: any;

export interface AuthSession {
  user: User;
  role: string;
  supabaseClient: SupabaseClient;
  supabaseService: SupabaseClient;
}

export async function verifyAuth(req: Request): Promise<{ session: AuthSession | null; error: Error | null }> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return { session: null, error: new Error("Supabase URL or Anon key configuration missing") };
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { session: null, error: new Error("Unauthorized: Invalid authorization header format") };
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return { session: null, error: new Error("Unauthorized: Missing bearer token") };
    }

    // Create the client with user's authorization to verify the token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      return { session: null, error: error ?? new Error("Unauthorized: Invalid session token") };
    }

    // Create the service role client to fetch authoritative details
    // Fallback to supabaseClient if service role key is not configured locally
    const hasServiceKey = !!supabaseServiceRoleKey;
    const supabaseService = hasServiceKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
            persistSession: false,
          },
        })
      : supabaseClient;

    // Fetch the user's real role server-side using the service role client
    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.warn("Could not fetch user profile role, defaulting to fan:", profileError.message);
    }

    const role = profile?.role ?? "fan";

    return {
      session: {
        user,
        role,
        supabaseClient,
        supabaseService,
      },
      error: null,
    };
  } catch (err) {
    return { session: null, error: err instanceof Error ? err : new Error("Authentication failed") };
  }
}
