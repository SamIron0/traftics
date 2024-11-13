import { supabase } from './supabase'

export async function getAuthUser() {
  const session = await supabase.auth.getSession()
  return session.data.session?.user
}
