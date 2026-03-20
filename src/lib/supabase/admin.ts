import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Service role client — bypasses RLS. NEVER import in browser-bound files.
// Falls back to placeholders at build time; real values required at runtime.
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
