import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jpbpgynrslslokzuiefb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYnBneW5yc2xzbG9renVpZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5Mzc0ODMsImV4cCI6MjA5MDUxMzQ4M30.k1iAhXMoHiQ9k64jlJjECdE1TflBS5jSz-bN3n0XgnY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
