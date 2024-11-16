export const generateTrackingScript = async (id?: string) => {
  try {
    const response = await fetch(`/api/tracking-code/generate`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });

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
