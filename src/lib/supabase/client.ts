import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getRealtimeClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) return null;

  _client = createSupabaseClient(url, anon);
  return _client;
}

// Legacy stub — kept for compatibility
export function createClient() {
  return getRealtimeClient();
}
