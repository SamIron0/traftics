export const generateTrackingScript = async () => {
  try {
    const response = await fetch(
      `/api/tracking-code/generate`,
      {
        method: "GET",
      }
    );
    if (!response.ok) throw new Error("Failed to generate tracking code");
    const data = await response.json();
    return {
      script: data.script,
      websiteId: data.websiteId,
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
