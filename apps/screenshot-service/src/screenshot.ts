import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';
import { rebuildDOMFromSnapshot } from './utils/dom-rebuilder';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function processScreenshot(data: any) {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Rebuild DOM from events
    const container = await rebuildDOMFromSnapshot(data.events);
    if (!container) {
      throw new Error('Failed to rebuild DOM');
    }

    await page.setContent(container.outerHTML);
    await page.waitForNetworkIdle();

    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: true
    });

    await browser.close();

    // Store screenshot in Supabase
    await supabase
      .from('screenshots')
      .insert({
        session_id: data.sessionId,
        site_id: data.siteId,
        image: screenshot
      });

  } catch (error) {
    console.error('Error processing screenshot:', error);
  }
} 