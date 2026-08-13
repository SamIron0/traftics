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
  const [status, setStatus] = useState<Pick<AuthStatus, "user" | "loading">>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    async function checkStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setStatus({
        user: user ?? null,
        loading: false,
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
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return {
    ...status,
    signOut,
  };
}
