type AnalyticsStore = {
  events: Record<string, { count: number; lastAt: string; payloadSample?: unknown }>;
};

function readStore(): AnalyticsStore {
  if (typeof window === 'undefined') return { events: {} };
  try {
    const raw = localStorage.getItem('analytics');
    if (!raw) return { events: {} };
    return JSON.parse(raw) as AnalyticsStore;
  } catch {
    return { events: {} };
  }
}

function writeStore(store: AnalyticsStore) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('analytics', JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function trackEvent(name: string, payload?: unknown) {
  const store = readStore();
  const prev = store.events[name] || { count: 0, lastAt: '' };
  const next = {
    count: prev.count + 1,
    lastAt: new Date().toISOString(),
    payloadSample: payload ?? prev.payloadSample,
  };
  store.events[name] = next;
  writeStore(store);
}

export function getAnalyticsSummary(): AnalyticsStore['events'] {
  return readStore().events;
}
