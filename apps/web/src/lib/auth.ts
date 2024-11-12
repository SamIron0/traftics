import { supabase } from './supabase'

export async function getAuthUser(request: Request) {
  const session = await supabase.auth.getSession()
  return session.data.session?.user
}
