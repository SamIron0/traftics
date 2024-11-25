import {
  eventWithTime,
  IncrementalSource,
  MouseInteractions,
} from "@rrweb/types";

export function generateMockHeatmapData(
  width: number,
  height: number,
  numberOfClicks: number = 8
): eventWithTime[] {
  const events: eventWithTime[] = [];

  // Create some "hot spots" where clicks are more likely to occur
  const hotspots = [
    { x: width * 0.2, y: height * 0.2, radius: 100 }, // top-left
    { x: width * 0.8, y: height * 0.2, radius: 100 }, // top-right
    { x: width * 0.5, y: height * 0.5, radius: 150 }, // center
    { x: width * 0.3, y: height * 0.8, radius: 100 }, // bottom-left
  ];

  for (let i = 0; i < numberOfClicks; i++) {
    // Randomly select a hotspot or generate a random position
    const useHotspot = Math.random() < 0.7; // 70% of clicks will be near hotspots

    let x: number;
    let y: number;

    if (useHotspot) {
      const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
      // Generate point within hotspot radius using gaussian-like distribution
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * hotspot.radius;
      x = hotspot.x + Math.cos(angle) * radius;
      y = hotspot.y + Math.sin(angle) * radius;
    } else {
      // Random position anywhere on the surface
      x = Math.random() * width;
      y = Math.random() * height;
    }

    // Create mock event
    events.push({
      type: 3, // IncrementalSnapshot
      data: {
        source: IncrementalSource.MouseInteraction,
        type: MouseInteractions.Click,
        x: Math.min(Math.max(0, x), width),
        y: Math.min(Math.max(0, y), height),
        id: i,
      },
      timestamp: Date.now() + i * 1000, // Spread clicks over time
    });
  }

  return events;
}

// Usage example:
// const mockEvents = generateMockHeatmapData(1024, 768, 200);
