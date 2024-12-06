import * as UAParser from 'ua-parser-js';

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser.UAParser(userAgent);
  return {
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice(),
  };
} 