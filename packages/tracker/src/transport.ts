import { Session } from "@session-recorder/types";

export async function sendEvents(
  collectorUrl: string,
  data: Partial<Session>
): Promise<void> {
  try {
    console.debug('Sending events to collector:', data);
    const baseUrl = "https://gaha.vercel.app/api/collect";
    const response = await fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.debug('Events sent successfully');
  } catch (error) {
    console.error("Failed to send events:", error);
  }
}
