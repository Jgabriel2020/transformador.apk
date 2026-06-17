import { createClient } from "@supabase/supabase-js";

export const supabaseServer = createClient(
  "https://edegxmnfvffxvjscllxh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZWd4bW5mdmZmeHZqc2NsbHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NDU5MTUsImV4cCI6MjA5NzIyMTkxNX0.nyy5-dqjaVn7wOM1ZTtROm_lxJstZy44KUL1e8zE0Cc"
);
