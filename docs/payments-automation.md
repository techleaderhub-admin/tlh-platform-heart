# Payments + Automation

## Scope
This phase adds a provider-neutral payment catalog and operational ledger around the existing `payments` table.

### Payment catalog
`payment_products` defines:
- product name and description
- price/currency
- optional membership level granted by successful payment
- active/inactive state

### Payment ledger
Existing `payments` records now support:
- product reference
- metadata
- unique external transaction IDs

### Idempotent provider events
`payment_events` stores provider event IDs with a unique `(provider, provider_event_id)` key. `record_payment_event()` is safe to call repeatedly for the same provider event.

This is the database contract for a future payment webhook/edge function. No payment provider or secret/API key is hard-coded.

### Membership automation
When a payment is inserted or updated to `paid`, `completed`, or `success` and its active product maps to an L1+ membership:
- the student's membership is activated/upgraded;
- a lower existing membership is never downgraded by a payment;
- the membership history trigger records the change.

No payment data or fake products are seeded by this phase.
