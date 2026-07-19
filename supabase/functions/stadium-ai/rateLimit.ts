import { SupabaseClient } from "npm:@supabase/supabase-js@2.45.4";

export async function checkRateLimitServer(
  supabaseClient: SupabaseClient,
  userId: string,
  cooldownMs = 3000,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  try {
    const cooldownInterval = `${cooldownMs / 1000} seconds`;
    const { data, error } = await supabaseClient.rpc("check_and_update_rate_limit", {
      p_user_id: userId,
      p_cooldown_interval: cooldownInterval,
    });

    if (error) {
      console.warn("Rate limiter RPC check failed, falling back:", error.message);
      return checkRateLimitFallback(supabaseClient, userId, cooldownMs);
    }

    // Handle array response from RPC (RETURNS TABLE returns array of rows)
    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      return {
        allowed: !!result.allowed,
        retryAfterMs: typeof result.retry_after_ms === "number" ? result.retry_after_ms : 0,
      };
    }

    // Handle single object response if library parses it so
    if (data && typeof data === "object") {
      const result = data as { allowed: boolean; retry_after_ms: number };
      return {
        allowed: !!result.allowed,
        retryAfterMs: typeof result.retry_after_ms === "number" ? result.retry_after_ms : 0,
      };
    }

    return checkRateLimitFallback(supabaseClient, userId, cooldownMs);
  } catch (err) {
    console.warn("Rate limiter RPC threw error, falling back:", err);
    return checkRateLimitFallback(supabaseClient, userId, cooldownMs);
  }
}

async function checkRateLimitFallback(
  supabaseClient: SupabaseClient,
  userId: string,
  cooldownMs: number,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  try {
    const { data, error } = await supabaseClient
      .from("rate_limits")
      .select("last_request_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Rate limiter fallback check failed:", error.message);
      return { allowed: true, retryAfterMs: 0 };
    }

    const now = new Date();

    if (data) {
      const lastRequest = new Date(data.last_request_at).getTime();
      const elapsed = now.getTime() - lastRequest;

      if (elapsed < cooldownMs) {
        return { allowed: false, retryAfterMs: cooldownMs - elapsed };
      }
    }

    await supabaseClient
      .from("rate_limits")
      .upsert({ user_id: userId, last_request_at: now.toISOString() });

    return { allowed: true, retryAfterMs: 0 };
  } catch (err) {
    console.error("Rate limiter fallback failed with exception:", err);
    return { allowed: true, retryAfterMs: 0 };
  }
}
