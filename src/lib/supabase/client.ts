// Supabase client replaced by local JWT auth. Use /api/auth/* routes instead.
export function createClient() {
  throw new Error("Supabase client not available — use local auth API routes");
}
