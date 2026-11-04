# Rental terms and Revolut readiness

This change prepares public customer information; it does not activate acquiring or guarantee merchant approval.

## Before publishing / operational handover

- Owner confirmed: free cancellation at least 48 hours before rental; otherwise individually assessed fee up to CZK 200; cash deposit returned immediately after in-person inspection; other deposit refunds initiated within three working days.
- This draft also applies three working days to cancellation refunds. Confirm operational capacity for this deadline before publishing.
- Delivery is available; the last rental day is the carrier handover date, not arrival at the studio. Backend currently adds only one cleaning day (`src/v2/utils/availability.ts`). Until shipping-aware availability is implemented, manually block each physical item for outbound/return transit and inspection before confirming delivery reservations. Do not promise adjacent bookings based only on the calendar.
- For services starting within 14 days of distance contract conclusion, obtain and retain the customer's explicit early-start request and the required explanation before performance. The booking links do not collect that consent.
- Send the accepted terms with the reservation confirmation (durable copy), and retain the applicable version. These UI changes do not add version snapshots to backend emails.
- Verify privacy recipient/retention information against actual processor agreements; update it when the gateway is activated. This is a focused improvement, not a completed processor inventory.
- Ask Revolut to confirm acceptance of advance payment for clothing rental delivered on future dates before activating online acquiring. No support message has been sent by this change.
- Online Revolut/card payments remain unavailable. Add actual payment methods/branding only alongside a working integration. Refund acquired payments through the original provider, never as cash; the cash-deposit rule applies to cash paid originally.

## Sources checked 4 November 2026

- Revolut Payment Processing Services Agreement: https://www.revolut.com/en-CZ/legal/business-acquiring/ — distinguish the upcoming 30 November version from the current 22 September agreement, especially customer disclosures, refunds, and advance/future-service payments.
- Current agreement PDF: https://cdn.revolut.com/terms_and_conditions/pdf/payment_processing_services_agreement_2d7817f8_1.2.1_1784300461_en.pdf
- Consumer service withdrawal: https://coi.gov.cz/faq/8-odstoupeni-od-smlouvy-do-14-dnu-u-sluzeb/
- Complaints: https://coi.gov.cz/pro-podnikatele/informace-pro-prodejce-zbozi-a-sluzeb/reklamace-zbozi-a-sluzeb/
- Personal data information: https://uoou.gov.cz/verejnost/zakladni-prirucka-k-ochrane-udaju

## Scope

Rental terms, delivery/returns, deposit/cancellation disclosures, complaints and ADR, privacy wording/mobile spacing, and links immediately before booking submission. Sale-specific checkout/terms are outside this rental flow.
