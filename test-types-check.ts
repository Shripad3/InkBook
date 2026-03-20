import { createClient } from "@supabase/supabase-js";
import type { Database } from "./src/types/database";

const client = createClient<Database>("url", "key");

async function main() {
  const { data } = await client.from("artists").select("id, name").single();
  // This should infer data as { id: string; name: string | null } | null
  return data?.name;
}
