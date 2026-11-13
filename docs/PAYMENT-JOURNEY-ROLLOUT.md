# Client payment journey — deployment blocked pending account access

Prepared 13 November 2026 against main 8fb7d8c9697ecff54a97affcfcc66b3ae0cf5c11.
This draft incorporates the unmerged payment-access work from PR #6, fixes an unrelated accidental payout query edit in that draft, and adds the project/review/single-checkout journey. Production has not changed.

## Observed source problems

- Dashboard links directly to reusable Stripe Payment Links in another tab. It has no persistent order/session lock. Reloading can offer payment again.
- `dossiers.maybeSingle()` failures are ignored; an absent dossier falls back to unpaid, including after a failed query or duplicate dossier rows.
- The deployed `/api/webhook.js` source only logs a completed session. The more complete root `webhook.js` is a separate, legacy file. Actual Stripe webhook destinations still need inspection.
- `/success` announces payment and email confirmation without verifying either.
- Prior navigation gating only covered desktop links, and the checked-in SQL permits client document access without a payment requirement. Live RLS policies are not known yet.

These are verified code defects, not a transaction-level diagnosis of the reported double payments. No real charges, refunds, customer emails or data changes were made.

## Intended customer path

1. Account and project: first company name, activity, country. Passport/files are not requested yet.
2. Summary: service, project, account email and existing US$1,490 one-time price. One secure checkout button.
3. An open checkout is resumed, not duplicated. Database reservation plus a stable Stripe idempotency key handles double clicks, concurrent tabs, retries and lost responses. A new key is issued only after Stripe confirms that the prior session expired unpaid. Old ambiguous attempts stop for review.
4. Pending confirmation is visibly different from paid. Neither a redirect query nor a client-editable dossier status grants access. Return-page reconciliation and signed webhooks verify the payment.
5. Confirmed payment unlocks uploads and official documents on mobile and desktop, with ownership/payment enforcement in the database. Dossier progress is preserved when a webhook is redelivered.
6. `payment_intent_data.receipt_email` requests a Stripe payment receipt after a live successful payment. No assertion that the email was delivered is made. A bespoke Luminos email is not implemented: that would need a mail provider and verified sending domain.

Annual renewal is separated from first-time company formation: the draft links to the team to confirm the correct renewal period. It does not silently offer a second $990 charge alongside incorporation. A separate invoice/order per renewal period should precede a future self-service renewal flow.

## Current access and activation blockers

- Supabase connection and signed-in browser expose only Start Business World (`grwimhqsthcmfwblwdwg`). Luminos frontend uses `nyqmhhtxqszlffqwjumw`; the connector returns permission denied for that project.
- Vercel project `luminous` is accessible and the expected Stripe/Supabase variable names exist. Their secret values were not read or exported.
- Stripe browser opens the login page. Actual payments, Payment Link settings, webhook routing and receipts have not been inspected.

Do not merge/deploy this dashboard to production before the following work. Existing paid clients would otherwise be locked out by the new ledger.

1. Connect the actual Luminos Supabase project and Stripe account. Inspect schema, RLS policies, triggers, grants, all privileged RPCs and storage paths. Run security advisers. In particular, verify `official_documents` and dossier company fields.
2. Confirm a real administrator with server-managed `app_metadata.role=admin` and working recovery; the browser-only admin password is replaced in this draft. Never use `profiles.type` or user-editable metadata as authorization.
3. Confirm Stripe webhook destinations and preserve any active legacy commission handling. New webhook fulfillment deliberately does not create affiliate transfers or modify balances. Review root legacy endpoints before cutover.
4. Check duplicate dossiers and existing payment records, discounts, refunds and disputes. Run `scripts/reconcile-payments.cjs` in dry-run mode. Resolve every active paid customer before enabling the gate; never infer payment from dossier status. The script cannot resolve sessions with missing metadata or missing references automatically.
5. Review and apply `20261020_payment_gate.sql`, then `20261113_single_formation_checkout.sql`. Schema and SQL execution have NOT been validated against the real project. Preserve existing customer data. Stage the rollout in a maintenance window, reconcile verified receipts, validate actual SQL access as anonymous/unpaid/paid/other user/admin, and test failure rollback.
6. Set `LUMINOS_PAYMENT_MODE=test` on an isolated test deployment with test Stripe keys and a test database. Set `LUMINOS_CHECKOUT_ENABLED=true` only when ready. Keep the flag unset/false on arbitrary previews. The API refuses new checkout when disabled.
7. Exercise successful payment, cancelled checkout, webhook delayed/duplicated, database failure, expired checkout, retry after a lost response, two tabs, and existing paid accounts. Verify the actual Stripe receipt in live settings; automatic test payments do not email receipts.
8. Configure signed checkout completion/async-success events, then production mode and matching live keys. Deactivate old reusable Payment Links after safely reconciling in-flight checkouts, otherwise saved external links can still accept a second payment. Update old links outside the site where applicable.
9. Publish and verify authenticated end-to-end behavior, including staff access. Do not roll back only the frontend over hardened DB policies without checking compatibility.

## Validation performed

- 12 automated service/API tests: concurrent checkouts, stable snapshots, paid/legacy gates, lost persistence, webhook delay/retry, expired-only rotation, old idempotency ambiguity, identity/amount validation, auth, activation flag, signature/mode rejection, unavailable status.
- Existing payment-gate and dashboard-state regression suites, updated to allow document viewing after confirmed payment.
- Synthetic browser checks at 1440px and 390px: summary, triple click produces one frontend request, waiting/error/review states hide payment, unpaid direct/mobile access fails, paid file access works, no horizontal overflow.
- No live SQL, Stripe charge, email delivery or real authenticated customer test yet.

## Sources

- https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- https://docs.stripe.com/api/idempotent_requests
- https://docs.stripe.com/receipts
- https://supabase.com/docs/guides/database/postgres/row-level-security
