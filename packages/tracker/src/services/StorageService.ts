import { Session } from "../types";

export class StorageService {
  private readonly MAX_FAILED_EVENTS = 50;

  storeFailedEvents(sessionId: string, payload: Session): void {
    try {
      const key = `failed_events_${sessionId}`;
      const existingData = localStorage.getItem(key);
      const failedEvents = existingData ? JSON.parse(existingData) : [];

      failedEvents.push({
        payload,
        timestamp: Date.now(),
      });

      if (failedEvents.length > this.MAX_FAILED_EVENTS) {
        failedEvents.shift();
      }

      localStorage.setItem(key, JSON.stringify(failedEvents));
    } catch (error) {
      console.error("Failed to store failed events:", error);
    }
  }

  getFailedEvents(sessionId: string): Array<{
    payload: Session;
    timestamp: number;
  }> {
    try {
      const key = `failed_events_${sessionId}`;
      const existingData = localStorage.getItem(key);
      return existingData ? JSON.parse(existingData) : [];
    } catch (error) {
      console.error("Failed to retrieve failed events:", error);
      return [];
    }
  }

  clearFailedEvents(sessionId: string): void {
    try {
      const key = `failed_events_${sessionId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear failed events:", error);
    }
  }
} 