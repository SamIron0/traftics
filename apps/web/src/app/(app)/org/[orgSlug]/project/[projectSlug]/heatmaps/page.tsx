"use client";
import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";

export default function HeatmapsPage() {
  const { heatmaps, setHeatmaps } = useAppStore.getState();

  useEffect(() => {
    const fetchHeatmaps = async () => {
      try {
        const response = await fetch("/api/heatmaps");
        if (!response.ok) throw new Error("Failed to fetch heatmaps");
        const data = await response.json();
        setHeatmaps(data.heatmaps);
      } catch (error) {
        console.error("Error fetching heatmaps:", error);
      }
    };
    if (heatmaps.length === 0) {
      fetchHeatmaps();
    }
  }, [setHeatmaps]);

  return (
    <div>
      <h1>Heatmaps</h1>
    </div>
  );
}
