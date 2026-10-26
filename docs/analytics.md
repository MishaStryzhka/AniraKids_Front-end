# AniraKids GA4

Production stream: G-2CC3J398BS (public ID). Collection is restricted to anirakids.cz and www.anirakids.cz; previews and local development do not send data.

Basic consent: no Google Analytics script loads before explicit approval. Equal-weight accept/refuse controls appear on public pages. Preferences remain available at /cookies; consent expires after 180 days. Revocation disables collection and clears _ga cookies. Cross-tab changes are observed. Ads consent remains denied and Google signals/personalization are disabled.

The stream's Enhanced measurement must remain OFF. It was disabled in Google Analytics during setup on 2026-10-26. Pageviews are explicitly sent by the SPA; automatic history/form/outbound-link measurement would duplicate views and could expose private URLs. Do not enable user-provided-data collection.

## Events

- page_view: allowlisted public routes, with product routes grouped as /produkt. No query strings, fragments, arbitrary titles or private paths. External referrer is origin-only.
- view_item: public product ID only, after successful product load.
- begin_checkout: successful product selection through the reservation button.
- check_availability: completed size/date availability check; boolean available only.
- reservation_created / fitting_created: API success, not a payment. Operation IDs only deduplicate in memory and are never sent.

No purchase/revenue events yet: payments are confirmed later by staff, so a client booking response cannot establish revenue. Financial reporting stays in the booking database. Do not infer revenue from these events.

Excluded: admin, account, partner portal, private reservation/fitting status, email confirmation and password recovery. Never send names, contact fields, access tokens, reservation numbers or raw form input.

Verification: Jest consent/privacy tests, existing booking/product tests, responsive browser suite .github/analytics-consent.spec.js. Browser fixtures serve the build under a mocked production origin and intercept Google script requests; no synthetic booking/customer data is sent to Google or the real backend.
