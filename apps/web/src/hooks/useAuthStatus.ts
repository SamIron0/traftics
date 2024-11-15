"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface AuthStatus {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuthStatus(): AuthStatus {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<AuthStatus>({
    user: null,
    loading: true,
    signOut: async () => {},
  });

  useEffect(() => {
    async function checkStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus({
          user: null,
          loading: false,
          signOut: async () => {},
        });
        return;
      }

      setStatus({
        user,
        loading: false,
        signOut: async () => {},
      });
    }

    checkStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return {
    ...status,
    signOut,
  };
}
