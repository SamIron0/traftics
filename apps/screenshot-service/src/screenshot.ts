import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';
import { rebuildDOMFromSnapshot } from './utils/dom-rebuilder';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function processScreenshot(data: any) {
  let browser;
  try {
    console.log('Starting screenshot process for session:', data.sessionId);
    console.log('Chrome executable path:', await chromium.executablePath());
    console.log('Chrome args:', chromium.args);

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--headless=new',
        '--memory-pressure-off',
        '--single-process',
        '--deterministic-fetch',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update'
      ],
      defaultViewport: {
        width: 1280,
        height: 800
      },
      executablePath: process.env.CHROMIUM_PATH || await chromium.executablePath(),
      headless: true,
      protocolTimeout: 60000,
      timeout: 60000,
    }).catch(err => {
      console.error('Browser launch error details:', {
        message: err.message,
        code: err.code,
        errno: err.errno,
        syscall: err.syscall,
        stack: err.stack
      });
      throw err;
    });

    console.log('Browser launched successfully');
    const page = await browser.newPage();
    console.log('New page created');
    
    const container = await rebuildDOMFromSnapshot(data.events);
    if (!container) {
      throw new Error('Failed to rebuild DOM');
    }
    console.log('DOM rebuilt successfully');

    await page.setContent(container.outerHTML);
    console.log('Page content set');
    await page.waitForNetworkIdle();
    console.log('Network idle');

    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: true
    });
    console.log('Screenshot captured');

    await browser.close();
    console.log('Browser closed');

    // Upload to Supabase storage
    const filePath = `screenshots/${data.siteId}/${data.sessionId}.png`;
    console.log('Uploading to:', filePath);
    
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filePath, Buffer.from(screenshot, 'base64'), {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }
    console.log('Screenshot uploaded successfully');

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath);

    // Store reference in database
    await supabase
      .from('screenshots')
      .insert({
        session_id: data.sessionId,
        site_id: data.siteId,
        image_url: publicUrl.publicUrl,
        status: 'completed'
      });
    console.log('Database record created');

  } catch (error) {
    console.error('Error processing screenshot:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        errno: (error as any).errno,
        syscall: (error as any).syscall
      } : error,
      sessionId: data.sessionId,
      siteId: data.siteId
    });

    // Ensure browser is closed in case of error
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed after error');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    // Store error status
    await supabase
      .from('screenshots')
      .insert({
        session_id: data.sessionId,
        site_id: data.siteId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
  }
} 