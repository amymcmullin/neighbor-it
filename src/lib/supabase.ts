import { createClient } from "@supabase/supabase-js";

// Uses the PUBLISHABLE key only. Row Level Security (from schema.sql)
// is what keeps the data safe: the public can insert tickets, never read them.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
