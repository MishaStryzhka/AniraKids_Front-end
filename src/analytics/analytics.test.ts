export {};
let api: typeof import('./analytics');
const originalLocation = window.location;
const events = (): any[][] => ((window as any).dataLayer || []).map((x: any) => Array.from(x) as any[]).filter((x: any[]) => x[0] === 'event');
function location(path = '/saty', hostname = 'anirakids.cz') {
 Object.defineProperty(window, 'location', {configurable:true, value:{hostname, pathname:path, origin:'https://'+hostname}});
}
beforeEach(()=>{jest.resetModules();localStorage.clear();sessionStorage.clear();document.head.innerHTML='';delete (window as any).gtag;delete (window as any).dataLayer;location();api=require('./analytics');});
afterAll(()=>Object.defineProperty(window,'location',{configurable:true,value:originalLocation}));
test('no tag or events before consent or after refusal',()=>{api.syncAnalyticsPage();api.trackProduct('view_item','DET027');expect(document.querySelector('script')).toBeNull();api.setConsent('denied');expect(document.querySelector('script')).toBeNull();expect(events()).toEqual([]);});
test('granted consent loads one tag and one manual pageview; metadata has no secret URL/title/referrer',()=>{
 location('/produkt/private@example.test');document.title='Customer private@example.test';
 Object.defineProperty(document,'referrer',{configurable:true,value:'https://example.test/secret?token=PRIVATE'});
 api.setConsent('granted');api.syncAnalyticsPage();expect(document.querySelectorAll('#anirak-ga4')).toHaveLength(1);
 expect(events()).toHaveLength(1);expect(events()[0][2].page_location).toBe('https://anirakids.cz/produkt');
 expect(events()[0][2].page_referrer).toBe('https://example.test/');expect(JSON.stringify((window as any).dataLayer)).not.toMatch(/PRIVATE|private@example/);
});
test.each(['/admin','/ucet','/zkouska/ZK-123','/stav-rezervace','/confirmEmail','/refreshPassword','/partner/blaze'])('private route %s never initializes',path=>{location(path);api.setConsent('granted');api.trackBookingCreated('fitting','op');expect(document.querySelector('script')).toBeNull();expect(events()).toEqual([]);});
test('private navigation disables loaded tag; return to public route resumes',()=>{api.setConsent('granted');location('/ucet');api.syncAnalyticsPage();expect((window as any)['ga-disable-'+api.MEASUREMENT_ID]).toBe(true);api.trackProduct('view_item','DET027');expect(events()).toHaveLength(1);location('/saty');api.syncAnalyticsPage();expect(events()).toHaveLength(2);});
test('revocation disables analytics, removes GA cookies and blocks subsequent business events',()=>{api.setConsent('granted');document.cookie='_ga=test; Path=/';api.setConsent('denied');api.trackProduct('begin_checkout','DET027');expect(events()).toHaveLength(1);expect((window as any)['ga-disable-'+api.MEASUREMENT_ID]).toBe(true);expect(document.cookie).not.toContain('_ga=');});
test('localhost and previews never send to production stream',()=>{location('/saty','preview.pages.dev');api.setConsent('granted');api.trackProduct('view_item','DET027');expect(document.querySelector('script')).toBeNull();});
test('successful booking events are deduplicated, contain no identifiers or revenue',()=>{api.setConsent('granted');api.trackBookingCreated('rental','PRIVATE-OP');api.trackBookingCreated('rental','PRIVATE-OP');api.trackBookingCreated('fitting','OTHER-OP');expect(events().map(x=>x[1])).toEqual(['page_view','reservation_created','fitting_created']);expect(JSON.stringify(events())).not.toMatch(/PRIVATE|OTHER|purchase|value|currency/);});
test('expired, malformed or future consent fails closed',()=>{for(const value of ['oops',JSON.stringify({version:1,choice:'granted',at:0}),JSON.stringify({version:1,choice:'granted',at:Date.now()+10000})]){localStorage.setItem(api.CONSENT_KEY,value);expect(api.readConsent()).toBeNull();}});
test('cross-tab withdrawal stops collection',()=>{api.setConsent('granted');localStorage.setItem(api.CONSENT_KEY,JSON.stringify({version:1,choice:'denied',at:Date.now()}));api.syncStoredConsent();api.trackAvailability(true);expect(events()).toHaveLength(1);});
test('unavailable storage does not break consent or booking',()=>{const spy=jest.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});expect(()=>api.setConsent('granted')).not.toThrow();expect(()=>api.trackBookingCreated('rental','op')).not.toThrow();spy.mockRestore();});
