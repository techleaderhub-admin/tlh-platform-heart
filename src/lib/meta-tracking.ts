/**
 * Thin, safe wrapper around the Meta Pixel (fbq) and Google Tag Manager (dataLayer).
 *
 * Nothing is loaded here: if a pixel or GTM container is installed on the site, events are
 * forwarded to it; otherwise every call is a silent no-op. Never pass names, emails, phone
 * numbers or salary figures in `params` — Meta's Business Tools terms prohibit sensitive data.
 */

type FbqParams = Record<string, string | number | boolean>;

type TrackingWindow = Window & {
  fbq?: (command: "track" | "trackCustom", event: string, params?: FbqParams) => void;
  dataLayer?: Array<Record<string, unknown>>;
};

function getWindow(): TrackingWindow | undefined {
  return typeof window === "undefined" ? undefined : (window as TrackingWindow);
}

/** Standard Meta event, e.g. "Lead" or "CompleteRegistration". */
export function trackMetaStandard(event: string, params: FbqParams = {}) {
  const w = getWindow();
  if (!w) return;
  try {
    w.fbq?.("track", event, params);
    w.dataLayer?.push({ event: `meta_${event}`, ...params });
  } catch {
    // Tracking must never break registration.
  }
}

/** Custom Meta event, used for the qualifying opt-in steps. */
export function trackMetaCustom(event: string, params: FbqParams = {}) {
  const w = getWindow();
  if (!w) return;
  try {
    w.fbq?.("trackCustom", event, params);
    w.dataLayer?.push({ event, ...params });
  } catch {
    // Tracking must never break registration.
  }
}
