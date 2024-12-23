import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";

export function useVerificationStatus(websiteId: string | null) {
  const [isVerified, setIsVerified] = useState(false);
  const setWebsiteVerified = useAppStore(state => state.setWebsiteVerified);

  useEffect(() => {
    if (!websiteId) return;

    const checkVerification = async () => {
      try {
        const response = await fetch(
          `/api/websites/verify/status?websiteId=${websiteId}`
        );
        const data = await response.json();
        if (data.verified) {
          setIsVerified(true);
          setWebsiteVerified(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking verification status:", error);
        return false;
      }
    };

    // Initial check
    checkVerification();

    // Set up polling only if not verified
    const interval = setInterval(async () => {
      const verified = await checkVerification();
      if (verified) {
        clearInterval(interval);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [websiteId, setWebsiteVerified]);

  return isVerified;  
}
