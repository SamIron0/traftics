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
