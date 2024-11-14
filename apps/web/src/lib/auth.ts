import { createClient } from "@/utils/supabase/client";

export async function getAuthUser() {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  return session.data.session?.user;
}
