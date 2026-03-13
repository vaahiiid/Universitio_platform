declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export function trackPageView(path: string): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("config", "G-QVQPPZ9SGE", {
      page_path: path,
    });
  }
}
