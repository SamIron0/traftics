import { Session } from "@/types/api";
import { EventType, eventWithTime, IncrementalSource } from "@rrweb/types";
import * as UAParser from 'ua-parser-js';

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

  events.forEach(event => {
    if (event.type === EventType.Meta) {
      // New page visit
      if (currentPage) {
        // Update time spent on previous page
        const pageData = pageMetrics.get(currentPage);
        if (pageData && pageStartTime) {
          const timeSpent = event.timestamp - pageStartTime;
          pageData.timeSpent = (pageData.timeSpent || 0) + timeSpent; // Accumulate time spent
          pageMetrics.set(currentPage, pageData);
        }
      }

      currentPage = event.data.href;
      pageStartTime = event.timestamp;
      maxScroll = 0;

      pageMetrics.set(currentPage, {
        href: currentPage,
        timestamp: new Date(event.timestamp).toISOString(),
        referrer: document.referrer || null,
        loadTime: null,
        timeSpent: 0, // Initialize time spent
        scrollDepth: 0,
        errorCount: 0
      });
    }

    if (currentPage && event.type === EventType.IncrementalSnapshot) {
      const pageData = pageMetrics.get(currentPage);
      if (pageData) {
        if (event.data.source === IncrementalSource.Scroll) {
          // Update max scroll depth
          const scrollPercent = (event.data.y / document.documentElement.scrollHeight) * 100;
          maxScroll = Math.max(maxScroll, scrollPercent);
          pageData.scrollDepth = maxScroll; // Set max scroll depth
        }

        if (isCustomEvent(event)) {
          pageData.errorCount++; // Increment error count for custom events
        }

        pageMetrics.set(currentPage, pageData);
      }
    }
  });

  // Finalize metrics for the last page
  if (currentPage && pageStartTime) {
    const pageData = pageMetrics.get(currentPage);
    if (pageData) {
      const timeSpent = events[events.length - 1].timestamp - pageStartTime; // Calculate time spent on the last page
      pageData.timeSpent = (pageData.timeSpent || 0) + timeSpent; // Accumulate time spent
      pageMetrics.set(currentPage, pageData);
    }
  }

  return Array.from(pageMetrics.values());
}
export function getCountryNameFromCode(code: string | null): string {
  if (!code) return "Unknown";

  const countryName = countries[code.toUpperCase()];
  return countryName || "Unknown";
}

// ISO 3166-1 alpha-2 country codes
export const countries: { [key: string]: string } = {
  AF: "Afghanistan",
  AL: "Albania",
  DZ: "Algeria",
  AS: "American Samoa",
  AD: "Andorra",
  AO: "Angola",
  AI: "Anguilla",
  AQ: "Antarctica",
  AG: "Antigua and Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AW: "Aruba",
  AU: "Australia",
  AT: "Austria",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BM: "Bermuda",
  BT: "Bhutan",
  BO: "Bolivia",
  BA: "Bosnia and Herzegovina",
  BW: "Botswana",
  BR: "Brazil",
  IO: "British Indian Ocean Territory",
  BN: "Brunei",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  KH: "Cambodia",
  CM: "Cameroon",
  CA: "Canada",
  CV: "Cape Verde",
  KY: "Cayman Islands",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CX: "Christmas Island",
  CC: "Cocos (Keeling) Islands",
  CO: "Colombia",
  KM: "Comoros",
  CG: "Congo",
  CD: "Congo, Democratic Republic",
  CK: "Cook Islands",
  CR: "Costa Rica",
  CI: "Côte d'Ivoire",
  HR: "Croatia",
  CU: "Cuba",
  CW: "Curaçao",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  ET: "Ethiopia",
  FK: "Falkland Islands",
  FO: "Faroe Islands",
  FJ: "Fiji",
  FI: "Finland",
  FR: "France",
  GF: "French Guiana",
  PF: "French Polynesia",
  TF: "French Southern Territories",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GI: "Gibraltar",
  GR: "Greece",
  GL: "Greenland",
  GD: "Grenada",
  GP: "Guadeloupe",
  GU: "Guam",
  GT: "Guatemala",
  GG: "Guernsey",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HT: "Haiti",
  VA: "Holy See",
  HN: "Honduras",
  HK: "Hong Kong",
  HU: "Hungary",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran",
  IQ: "Iraq",
  IE: "Ireland",
  IM: "Isle of Man",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JE: "Jersey",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KP: "North Korea",
  KR: "South Korea",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: "Laos",
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MO: "Macao",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MU: "Mauritius",
  YT: "Mayotte",
  MX: "Mexico",
  FM: "Micronesia",
  MD: "Moldova",
  MC: "Monaco",
  MN: "Mongolia",
  ME: "Montenegro",
  MS: "Montserrat",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nauru",
  NP: "Nepal",
  NL: "Netherlands",
  NC: "New Caledonia",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  NU: "Niue",
  NF: "Norfolk Island",
  MK: "North Macedonia",
  MP: "Northern Mariana Islands",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PS: "Palestine",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PN: "Pitcairn",
  PL: "Poland",
  PT: "Portugal",
  PR: "Puerto Rico",
  QA: "Qatar",
  RE: "Réunion",
  RO: "Romania",
  RU: "Russia",
  RW: "Rwanda",
  BL: "Saint Barthélemy",
  SH: "Saint Helena",
  KN: "Saint Kitts and Nevis",
  LC: "Saint Lucia",
  MF: "Saint Martin",
  PM: "Saint Pierre and Miquelon",
  VC: "Saint Vincent and the Grenadines",
  WS: "Samoa",
  SM: "San Marino",
  ST: "Sao Tome and Principe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  RS: "Serbia",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SX: "Sint Maarten",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SO: "Somalia",
  ZA: "South Africa",
  GS: "South Georgia",
  SS: "South Sudan",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SJ: "Svalbard and Jan Mayen",
  SE: "Sweden",
  CH: "Switzerland",
  SY: "Syria",
  TW: "Taiwan",
  TJ: "Tajikistan",
  TZ: "Tanzania",
  TH: "Thailand",
  TL: "Timor-Leste",
  TG: "Togo",
  TK: "Tokelau",
  TO: "Tonga",
  TT: "Trinidad and Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TC: "Turks and Caicos Islands",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  UM: "United States Minor Outlying Islands",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VE: "Venezuela",
  VN: "Vietnam",
  VG: "Virgin Islands, British",
  VI: "Virgin Islands, U.S.",
  WF: "Wallis and Futuna",
  EH: "Western Sahara",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe"
};

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
