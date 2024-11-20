import { useState, useEffect } from "react";

export function useVerificationStatus(websiteId: string | null) {
  const [isVerified, setIsVerified] = useState(false);

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
          return true; // Return true if verified
        }
        return false; // Return false if not verified
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
        clearInterval(interval); // Stop polling if verified
      }
    }, 20000);

    // Cleanup
    return () => clearInterval(interval);
  }, [websiteId]);

  return isVerified;
}