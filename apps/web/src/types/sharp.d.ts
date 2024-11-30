declare module 'sharp' {
  interface Sharp {
    metadata(): Promise<{
      width?: number;
      height?: number;
    }>;
  }

  function sharp(
    input?: string | Buffer
  ): Sharp;

  export = sharp;
}
