import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let hasWarnedAboutFallback = false;

const FALLBACK_SUPABASE_URL = "https://wzippxpprwgdbhzhprmj.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_GrrSpG861rX4sjStAmRCKg_XlgO2cem";

function getSupabaseEnv() {
  const configuredUrl =
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ??
    import.meta.env.VITE_SUPABASE_URL;
  const configuredPublishableKey =
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (
    (!configuredUrl || !configuredPublishableKey) &&
    !hasWarnedAboutFallback
  ) {
    hasWarnedAboutFallback = true;
    console.warn(
      "Supabase env vars are missing. Falling back to the public ResQ project config.",
    );
  }

  return {
    url: configuredUrl ?? FALLBACK_SUPABASE_URL,
    publishableKey:
      configuredPublishableKey ?? FALLBACK_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getSupabaseEnv();
  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
