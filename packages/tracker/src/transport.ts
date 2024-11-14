import { Session } from "@session-recorder/types";

export async function sendEvents(
  collectorUrl: string,
  data: Partial<Session>
): Promise<void> {
  try {
    const baseUrl = collectorUrl || process.env.API_URL;
    const response = await fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to send events:", error);
  }
}
