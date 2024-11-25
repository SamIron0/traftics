declare module 'heatmap.js' {
  interface HeatmapConfiguration {
    container: HTMLElement;
    radius?: number;
    maxOpacity?: number;
    minOpacity?: number;
    blur?: number;
    gradient?: Record<string, string>;
  }

  interface HeatmapData {
    max?: number;
    min?: number;
    data: Array<{
      x: number;
      y: number;
      value: number;
    }>;
  }

  interface Heatmap {
    setData: (data: HeatmapData) => void;
    addData: (data: HeatmapData) => void;
    getDataURL: () => string;
    cleanup: () => void;
  }

  interface HeatmapConstructor {
    create: (config: HeatmapConfiguration) => Heatmap;
  }

  const h337: HeatmapConstructor;
  export default h337;
} 