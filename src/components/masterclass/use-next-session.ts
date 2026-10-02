import { useEffect, useState } from "react";

import { EVENT } from "@/components/masterclass/masterclass-content";

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Start time (UTC ms) of the next weekly session, in India time, after `nowMs`. */
export function nextSessionStart(nowMs: number): number {
  // Shift into IST "wall clock" so getUTC* reads Indian date and time.
  const ist = new Date(nowMs + IST_OFFSET_MS);
  const candidate = Date.UTC(
    ist.getUTCFullYear(),
    ist.getUTCMonth(),
    ist.getUTCDate(),
    EVENT.hourIst,
    EVENT.minuteIst,
  );
  const daysAhead = (EVENT.weekday - ist.getUTCDay() + 7) % 7;
  let startIst = candidate + daysAhead * DAY_MS;
  if (startIst <= ist.getTime()) startIst += 7 * DAY_MS;
  return startIst - IST_OFFSET_MS;
}

/** e.g. "Sunday, 4 October 2026", always in India time. */
export function formatSessionDate(startMs: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(startMs));
}

/** Compact label saved with each registration, e.g. "Sunday 4 Oct 2026, 11:00 AM IST". */
export function sessionLabel(startMs: number): string {
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
    .format(new Date(startMs))
    .replace(",", "");
  return `${date}, ${EVENT.timeLabel}`;
}

export type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function split(ms: number): Countdown {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/**
 * Next session and a live countdown. Returns null until mounted, so the server and the
 * first client render match (the page shows "Every Sunday · 11:00 AM IST" meanwhile).
 */
export function useNextSession() {
  const [state, setState] = useState<{ start: number; left: Countdown } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const start = nextSessionStart(now);
      setState({ start, left: split(start - now) });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return state;
}
