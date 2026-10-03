type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  if (gaId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId);

    if (!document.querySelector(`script[data-tlh-ga="${gaId}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      script.dataset.tlhGa = gaId;
      document.head.appendChild(script);
    }
  }

  const pixelId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
  if (pixelId && !window.fbq) {
    const fbq = (...args: unknown[]) => {
      (fbq as unknown as { callMethod?: (...values: unknown[]) => void }).callMethod?.(...args);
      if (!window.dataLayer) window.dataLayer = [];
      window.dataLayer.push(["fbq", ...args]);
    };
    window.fbq = fbq;
    window._fbq = fbq;
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");

    if (!document.querySelector(`script[data-tlh-fbpixel="${pixelId}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.dataset.tlhFbpixel = pixelId;
      document.head.appendChild(script);
    }
  }
}

export function trackAnalyticsEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  window.fbq?.("trackCustom", name, params);
}
