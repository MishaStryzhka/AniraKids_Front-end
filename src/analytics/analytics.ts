// Public measurement ID, not a credential. Only the production domains collect data.
export const MEASUREMENT_ID = 'G-2CC3J398BS';
export const CONSENT_KEY = 'anirak.analytics-consent.v1';
export const CONSENT_EVENT = 'anirak:analytics-consent';
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
type Choice = 'granted' | 'denied';
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: any[]) => void; [key: string]: any };
const w = () => window as AnalyticsWindow;
let memoryChoice: Choice | null = null;
let initialized = false;
let lastPage = '';
let lastProductView = '';
const completed = new Set<string>();
export function readConsent(): Choice | null {
  if (memoryChoice) return memoryChoice;
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (value?.version === 1 && ['granted', 'denied'].includes(value.choice) &&
        Number.isFinite(value.at) && value.at <= Date.now() && Date.now() - value.at < MAX_AGE) return value.choice;
  } catch { /* Storage may be unavailable; never assume consent. */ }
  return null;
}
export function productionHost() { return ['anirakids.cz', 'www.anirakids.cz'].includes(window.location.hostname); }
export function publicPage(path: string): string | null {
  const pages = ['/', '/saty', '/obleky', '/novinky', '/forWomen', '/forMen', '/forChildren', '/family-looky', '/popular', '/pronajem', '/hledani', '/oblibene', '/rezervace', '/zkouska', '/faq', '/kontakt', '/cookies', '/ochrana-osobnich-udaju', '/obchodni-podminky', '/podminky-pronajmu', '/aboutUs'];
  if (pages.includes(path)) return path;
  // Never forward arbitrary slugs, query strings, fragments or private record numbers.
  if (/^\/produkt\/[^/]+$/.test(path)) return '/produkt';
  return null;
}
function allowed() { return productionHost() && readConsent() === 'granted' && publicPage(window.location.pathname) !== null; }
function command(...args: any[]) { try { w().gtag?.(...args); } catch { /* Analytics must never interrupt booking. */ } }
function clearAnalyticsCookies() {
  for (const part of document.cookie.split(';')) {
    const name = part.trim().split('=')[0];
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of ['', window.location.hostname, '.anirakids.cz']) {
      document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ''} SameSite=Lax`;
    }
  }
}
export function setConsent(choice: Choice) {
  memoryChoice = choice;
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({version: 1, choice, at: Date.now()})); } catch { /* Keep this choice for this document. */ }
  if (choice === 'denied') {
    w()[`ga-disable-${MEASUREMENT_ID}`] = true;
    command('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    clearAnalyticsCookies();
    lastPage = '';
  }
  syncAnalyticsPage();
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
export function syncStoredConsent() { memoryChoice = null; syncAnalyticsPage(); window.dispatchEvent(new Event(CONSENT_EVENT)); }
export function syncAnalyticsPage() {
  const page = publicPage(window.location.pathname);
  const active = allowed();
  w()[`ga-disable-${MEASUREMENT_ID}`] = !active;
  if (!active) {
    lastPage = '';
    // Also overwrite metadata for a loaded tag before any automatic lifecycle event.
    if (initialized) command('set', {page_location: 'https://anirakids.cz/private', page_title: 'Private', page_referrer: ''});
    return;
  }
  const location = 'https://anirakids.cz' + page;
  let referrer = '';
  try { const url = new URL(document.referrer); if (url.origin !== window.location.origin) referrer = url.origin + '/'; } catch { /* No referrer. */ }
  const metadata = {page_location: location, page_title: page, page_referrer: referrer};
  if (!initialized) {
    initialized = true;
    w().dataLayer = w().dataLayer || [];
    w().gtag = function () { w().dataLayer!.push(arguments); };
    command('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    command('set', metadata);
    command('js', new Date());
    command('config', MEASUREMENT_ID, {...metadata, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, cookie_update: false});
    const script = document.createElement('script');
    script.id = 'anirak-ga4'; script.async = true; script.referrerPolicy = 'no-referrer';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(script);
  }
  command('consent', 'update', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
  command('set', metadata);
  if (lastPage !== window.location.pathname) {
    lastProductView = '';
    lastPage = window.location.pathname;
    command('event', 'page_view', {...metadata, send_to: MEASUREMENT_ID});
  }
}
export function trackProduct(event: 'view_item' | 'begin_checkout', productId: string) {
  if (!allowed() || !/^[a-zA-Z0-9_-]{1,64}$/.test(productId)) return;
  syncAnalyticsPage();
  if (event === 'view_item') {
    if (lastProductView === productId) return;
    lastProductView = productId;
  }
  command('event', event, {send_to: MEASUREMENT_ID, items: [{item_id: productId}]});
}
export function trackBookingCreated(kind: 'rental' | 'fitting', operationId: string) {
  if (!allowed() || completed.has(operationId)) return;
  // The operation ID only deduplicates locally; it is never sent to Google.
  completed.add(operationId);
  syncAnalyticsPage();
  command('event', kind === 'rental' ? 'reservation_created' : 'fitting_created', {send_to: MEASUREMENT_ID});
}

export function trackAvailability(available: boolean) {
  if (!allowed()) return;
  syncAnalyticsPage();
  command('event', 'check_availability', {send_to: MEASUREMENT_ID, available});
}
