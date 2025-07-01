import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://uqrdslqypuzxqadkufov.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcmRzbHF5cHV6eHFhZGt1Zm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzgyNzYsImV4cCI6MjA2Njk1NDI3Nn0.UEcTbha-GZLYioVfjSt2j2dCThYgkuqAbsOsso8dC2E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
