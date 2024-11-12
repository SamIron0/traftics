import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  return {
    user,
    signOut
  };
}