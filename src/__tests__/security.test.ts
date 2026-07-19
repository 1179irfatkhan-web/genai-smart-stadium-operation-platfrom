import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCorsHeaders } from '../../supabase/functions/stadium-ai/cors';
import { verifyAuth } from '../../supabase/functions/stadium-ai/auth';
import { checkRateLimitServer } from '../../supabase/functions/stadium-ai/rateLimit';

// Stub Deno global variable
vi.stubGlobal('Deno', {
  env: {
    get(key: string) {
      if (key === 'SUPABASE_URL') return 'https://test-project.supabase.co';
      if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-role-key';
      if (key === 'ALLOWED_ORIGINS') return 'https://stadiumiq.com,https://admin.stadiumiq.com';
      return undefined;
    },
  },
});

// Mock Supabase client creation
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((_url, _key) => {
    return {
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
      rpc: mockRpc,
    };
  }),
}));

describe('Server-side Security Improvements', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockRpc.mockReset();
  });

  describe('CORS Restrictions (cors.ts)', () => {
    it('allows localhost dynamic ports in development', () => {
      const req = new Request('https://api.example.com', {
        headers: { origin: 'http://localhost:5173' },
      });
      const headers = getCorsHeaders(req);
      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
      expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    });

    it('allows configured trusted origins', () => {
      const req = new Request('https://api.example.com', {
        headers: { origin: 'https://stadiumiq.com' },
      });
      const headers = getCorsHeaders(req);
      expect(headers['Access-Control-Allow-Origin']).toBe('https://stadiumiq.com');
    });

    it('falls back to default origin for untrusted origins', () => {
      const req = new Request('https://api.example.com', {
        headers: { origin: 'http://malicious.com' },
      });
      const headers = getCorsHeaders(req);
      expect(headers['Access-Control-Allow-Origin']).toBe('https://stadiumiq.com');
    });
  });

  describe('Authentication & Server-Side Roles (auth.ts)', () => {
    it('rejects requests with missing Authorization header', async () => {
      const req = new Request('https://api.example.com');
      const { session, error } = await verifyAuth(req);
      expect(session).toBeNull();
      expect(error?.message).toContain('Invalid authorization header format');
    });

    it('rejects requests with non-Bearer Authorization header', async () => {
      const req = new Request('https://api.example.com', {
        headers: { Authorization: 'Basic dGVzdDp0ZXN0' },
      });
      const { session, error } = await verifyAuth(req);
      expect(session).toBeNull();
      expect(error?.message).toContain('Invalid authorization header format');
    });

    it('successfully extracts user and fetches real role server-side via service role client', async () => {
      const req = new Request('https://api.example.com', {
        headers: { Authorization: 'Bearer valid-jwt-token' },
      });

      // Mock user return
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: 'user@example.com' } },
        error: null,
      });

      // Mock role return
      const mockSingle = vi.fn().mockResolvedValue({
        data: { role: 'venue_staff' },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const { session, error } = await verifyAuth(req);

      expect(error).toBeNull();
      expect(session?.user.id).toBe('user-123');
      expect(session?.role).toBe('venue_staff');
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });
  });

  describe('Server-Side Atomic Rate Limiting (rateLimit.ts)', () => {
    it('uses RPC call when checking rate limits', async () => {
      const mockClient = {
        rpc: mockRpc.mockResolvedValueOnce({
          data: [{ allowed: true, retry_after_ms: 0 }],
          error: null,
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await checkRateLimitServer(mockClient, 'user-123');
      expect(result.allowed).toBe(true);
      expect(result.retryAfterMs).toBe(0);
      expect(mockRpc).toHaveBeenCalledWith('check_and_update_rate_limit', {
        p_user_id: 'user-123',
        p_cooldown_interval: '3 seconds',
      });
    });

    it('handles RPC rate limit rejection response correctly', async () => {
      const mockClient = {
        rpc: mockRpc.mockResolvedValueOnce({
          data: [{ allowed: false, retry_after_ms: 2500 }],
          error: null,
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await checkRateLimitServer(mockClient, 'user-123');
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBe(2500);
    });

    it('falls back to database queries when RPC fails', async () => {
      // Mock RPC fail
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function not found' },
      });

      // Mock DB select and upsert for fallback
      const mockSingle = vi.fn().mockResolvedValue({
        data: null, // no previous request
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockImplementation((table) => {
        if (table === 'rate_limits') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return null;
      });

      const mockClient = {
        rpc: mockRpc,
        from: mockFrom,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await checkRateLimitServer(mockClient, 'user-123');
      expect(result.allowed).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('rate_limits');
      expect(mockUpsert).toHaveBeenCalled();
    });
  });
});
