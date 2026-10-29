import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/commons/config/env";
import type { Database } from "@/types/supabase";

/** Shared catalog caches must always read as an anonymous visitor. */
export function createPublicClient() {
  const { supabase } = getPublicEnv();
  return createClient<Database>(supabase.url, supabase.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
