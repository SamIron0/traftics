import { Session } from "@/types/api";
import { ErrorType } from "@/types/error";
import { EventType, eventWithTime, IncrementalSource, MouseInteractions } from "@rrweb/types";
import * as UAParser from 'ua-parser-js';


interface ScrollData {
  source: IncrementalSource.Scroll;
  y: number;
}

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser.UAParser(userAgent);
  return {
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice(),
  };
}
export const toDateTime = (secs: number) => {
  const t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined
) => {
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }

  const currentDate = new Date(); // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  );
  return Math.floor(trialEnd.getTime() / 1000); // Convert to Unix timestamp in seconds
};

export const getURL = (path: string = "") => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL &&
      process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL
      :
      process?.env?.NEXT_PUBLIC_VERCEL_URL &&
        process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ""
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        :
        "http://localhost:3000/";

  url = url.replace(/\/+$/, "");
  url = url.includes("http") ? url : `https://${url}`;
  path = path.replace(/^\/+/, "");

  return path ? `${url}/${path}` : url;
};

const toastKeyMap: { [key: string]: string[] } = {
  status: ["status", "status_description"],
  error: ["error", "error_description"],
};
const getToastRedirect = (
  path: string,
  toastType: string,
  toastName: string,
  toastDescription: string = "",
  disableButton: boolean = false,
  arbitraryParams: string = ""
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(
      toastDescription
    )}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

export function calculateAverageSessionDuration(sessions: Session[]): string {
  if (!sessions.length) return "0:00";

  const totalDuration = sessions.reduce((acc, session) => {
    return acc + (session.duration || 0);
  }, 0);

  const averageDuration = Math.floor(totalDuration / sessions.length);
  return formatPlayerTime(averageDuration);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateUniqueSlug(name: string, existingSlugs: string[]): string {
  let slug = generateSlug(name);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }

  return slug;
}

export const generateTrackingScript = async () => {
  try {
    const response = await fetch(
      `/api/tracking-code/generate`,
      {
        method: "GET",
      }
    );
    if (!response.ok) throw new Error("Failed to generate tracking code");
    const data = await response.json();
    return {
      script: data.script,
      websiteId: data.websiteId,
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export function generateScript(websiteId: string) {
  return `<script>
  (function(d, w) {
    w._r = w._r || {
      websiteId: "${websiteId}"
    };
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://493117db.traftics-tracker.pages.dev/tracker.js';
    d.head.appendChild(s);
  })(document, window);
  </script>`;
}

export function isCustomEvent(event: eventWithTime) {
  return event.type === EventType.Custom;
}

export function calculatePageMetrics(events: eventWithTime[]) {
  const pageMetrics = new Map<string, {
    href: string,
    timestamp: string,
    referrer: string | null,
    timeSpent: number | null,
    loadTime: number | null,
    scrollDepth: number,
    errorCount: number
  }>();

  let currentPage: string | null = null;
  let pageStartTime: number | null = null;
  let maxScroll = 0;
  let currentPageErrors = 0;

  // Process events chronologically
  events.sort((a, b) => a.timestamp - b.timestamp);

  for (const event of events) {
    // Handle URL change events (Custom event with url_change tag)
    if (event.type === EventType.Custom && event.data?.tag === 'url_change') {
      // If we were tracking a previous page, finalize its metrics
      if (currentPage && pageStartTime) {
        const existingMetrics = pageMetrics.get(currentPage);
        if (existingMetrics) {
          existingMetrics.timeSpent = event.timestamp - pageStartTime;
          existingMetrics.scrollDepth = maxScroll;
          existingMetrics.errorCount = currentPageErrors;
        }
      }

      const payload = event.data.payload as { href: string, referrer: string | null };
      currentPage = payload.href;
      pageStartTime = event.timestamp;
      maxScroll = 0;
      currentPageErrors = 0;

      // Initialize metrics for new page
      pageMetrics.set(currentPage, {
        href: payload.href,
        timestamp: new Date(event.timestamp).toISOString(),
        referrer: payload.referrer || null,
        timeSpent: null,
        loadTime: null,
        scrollDepth: 0,
        errorCount: 0
      });
    }
    // Handle page load metrics
    else if (event.type === EventType.Custom &&
      event.data?.tag === 'page_load_metrics' &&
      currentPage) {
      const metrics = pageMetrics.get(currentPage);
      const payload = event.data.payload as { href: string, loadTime: number };
      if (metrics && payload.href === currentPage) {
        metrics.loadTime = payload.loadTime;
      }
    }
    // Handle incremental snapshot events
    else if (event.type === EventType.IncrementalSnapshot && currentPage) {
      const metrics = pageMetrics.get(currentPage);
      if (!metrics) continue;

      // Handle scroll events
      if (event.data.source === IncrementalSource.Scroll) {
        const scrollPercentage = calculateScrollPercentage(event.data.y);
        maxScroll = Math.max(maxScroll, scrollPercentage);
        metrics.scrollDepth = maxScroll;
      }
    }
    // Handle error events
    else if (event.type === EventType.Custom && currentPage) {
      const metrics = pageMetrics.get(currentPage);
      if (!metrics) continue;

      const isErrorEvent = isCustomErrorEvent(event.data);
      if (isErrorEvent) {
        currentPageErrors++;
        metrics.errorCount = currentPageErrors;
      }
    }
  }


  // Finalize metrics for the last page
  if (currentPage && pageStartTime) {
    const lastMetrics = pageMetrics.get(currentPage);
    if (lastMetrics) {
      lastMetrics.timeSpent = events[events.length - 1].timestamp - pageStartTime;
      lastMetrics.scrollDepth = maxScroll;
      lastMetrics.errorCount = currentPageErrors;
    }
  }

  return Array.from(pageMetrics.values());
}
// Helper to calculate metrics from events
export function calculateSessionMetrics(events: eventWithTime[]) {
  let totalClicks = 0;
  let totalScrollDistance = 0;
  let totalInputs = 0;
  let errorCount = 0;
  let successCount = 0;

  events.forEach(event => {
    if (event.type === EventType.IncrementalSnapshot) {
      if (event.data.source === IncrementalSource.MouseInteraction) {
        if (event.data.type === MouseInteractions.Click) {
          totalClicks++;
        }
      } else if (event.data.source === IncrementalSource.Scroll) {
        const scrollData = event.data as ScrollData;
        totalScrollDistance += Math.abs(scrollData.y);
      } else if (event.data.source === IncrementalSource.Input) {
        totalInputs++;
      }
    } else if (isCustomEvent(event)) {
      if (event.data.tag === 'network_success') {
        successCount++;
      } else {
        const errorTag = event.data.tag as ErrorType;
        if (['error', 'console_error', 'network_error'].includes(errorTag)) {
          errorCount++;
        }
      }
    }
  });

  return {
    totalClicks,
    totalScrollDistance,
    totalInputs,
    errorCount,
    successCount
  };
}
// Helper function to calculate scroll percentage
function calculateScrollPercentage(scrollY: number): number {
  console.log("scrollY", scrollY);
  const docHeight = Math.max(
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
  const windowHeight = window.innerHeight;
  const scrollPercent = (scrollY + windowHeight) / docHeight * 100;
  return Math.min(Math.max(scrollPercent, 0), 100);
}

// Helper function to check if an event is an error event
function isCustomErrorEvent(data: {tag: string}): boolean {
  const errorTags = ['error', 'console_error', 'runtime_error', 'network_error', 'unhandled_promise'];
  return errorTags.includes(data.tag);
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
export const formatPlayerTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription: string = "",
  disableButton: boolean = false,
  arbitraryParams: string = ""
) =>
  getToastRedirect(
    path,
    "error",
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams
  );
