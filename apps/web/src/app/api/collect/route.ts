import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { addToQueue } from "@/server/collector/queue";
import { Session } from "@/types/api";
import { WebsiteService } from "@/server/services/website.service";
import type { eventWithTime } from '@rrweb/types';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { rebuildDOMFromSnapshot, cleanupRebuiltDOM } from '@/utils/dom-rebuilder';

function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

export async function POST(request: Request) {
  try {
    const session: Session = await request.json();

    if (!session.site_id || !session.id || !session.events) {
      return corsResponse(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      );
    }

    // Only check and update verification if this is the first event
    if (session.events.some((event: eventWithTime) => event.type === 4)) {
      try {
        const isVerified = await WebsiteService.getVerificationStatus(session.site_id);
        
        if (!isVerified) {
          await WebsiteService.verifyWebsite(session.site_id);
        }
        const screenshot = await captureScreenshot(session.events);
        console.log(screenshot);
      } catch (error) {
        return corsResponse(
          NextResponse.json({ error: "Invalid website ID" }, { status: 400 })
        );
      }
    }

    const processedEvents = await processEvents(session.events);

    await addToQueue({
      ...session,
      events: processedEvents,
    });

    return corsResponse(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("Error processing session:", error);
    return corsResponse(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}

async function captureScreenshot(events: eventWithTime[]): Promise<string | null> {
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
    
    // Rebuild DOM and wait for it to be ready
    const container = await rebuildDOMFromSnapshot(events);
    if (!container) {
      throw new Error('Failed to rebuild DOM');
    }

    // Inject the rebuilt DOM into the page
    await page.setContent(container.outerHTML);

    // Wait for any images/resources to load
    await page.waitForNetworkIdle();

    // Take screenshot
    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: true
    });

    await browser.close();
    
    // Clean up the temporary DOM
    cleanupRebuiltDOM(container);
    
    return screenshot as string;

  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}
