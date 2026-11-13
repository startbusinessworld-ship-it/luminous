# Payment gate rollout — not active until infrastructure is verified

This change must not be merged before the Supabase migration and existing-customer reconciliation. Publishing the frontend first would intentionally fail closed and lock existing paid clients out. No live data has been changed by these source changes.

## Before activation

1. Connect the actual Supabase project, Vercel project and Stripe account. Confirm production environment values for `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Never expose their values in chat or code.
2. Inspect the live schema, policies, triggers and grants. Confirm dossiers have a unique user_id, the client-editable company fields exist, and documents have dossier_id/type/status. Inspect existing RPCs that can mutate dossiers/documents; table policies do not secure privileged RPCs. Inspect any other document-storage paths before asserting coverage.
3. Assign `app_metadata.role = admin` through the trusted Supabase admin interface to the verified owner's Auth account. The old browser-only password is removed. Do not infer the admin account from public profiles.type or user_metadata. Confirm sign-in recovery first.
4. Inventory existing Stripe webhook destinations. `/api/webhook` is the corrected route. The unused root `webhook.js` remains legacy code and must not be configured as an additional fulfillment endpoint. Verify whether it is active elsewhere and preserve any existing commission processing before switching endpoints. This change does not create transfers or modify affiliate balances.
5. Review and apply `migrations/20261020_payment_gate.sql`. It replaces policies on dossiers/documents, adds a private-write payment ledger and enforces client status changes. Existing rows remain. Unknown policies and administrative integrations must be reviewed before replacement. Roll out during a maintenance window: existing clients need their receipts reconciled before reopening uploads.
6. Run `node scripts/reconcile-payments.cjs` with trusted server credentials and the real Stripe `plink_...` identifiers in `LEGACY_CREATION_PAYMENT_LINK_ID` and `LEGACY_RENEWAL_PAYMENT_LINK_ID`. Dry-run by default. It checks Stripe payment status, live mode, amount, currency, source, ownership against Auth, refunds and disputes. It never trusts dossier status. Missing references or unrecognised legacy metadata need manual reconciliation against Stripe; do not ask already-paid clients to pay again.
7. Resolve all active paid accounts flagged for manual review. Apply approved matches with `--apply`. This is an idempotent receipt import; it does not charge clients. Historical exceptions/discounts need individually verified evidence and an explicit data-model decision; do not disable the gate.
8. Configure the signed Stripe webhook for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Only paid sessions from the authenticated new checkout path are fulfilled automatically. Confirm sandbox/live keys and signing secrets are not mixed.
9. Run SQL access checks using anonymous, unpaid, paid, other-user and app_metadata-admin sessions. Verify forged receipts and forged dossier status fail, documents require ownership and a creation receipt, and official documents remain admin-managed. Verify duplicate webhook deliveries and concurrent sessions do not reset progressed dossiers.
10. Publish the code, verify the production functions start, then test payment cancellation, return before webhook delivery, unpaid direct/mobile navigation, upload and submission for an existing paid client. Use a Stripe sandbox for payment simulation; do not create a real charge without the owner's explicit instruction.

## Checks completed locally

- `node tests/payment-gate.cjs`: payment validation, account binding, unpaid navigation and zero document/submission writes, persistence failure handling.
- `node tests/dashboard-state.cjs`: progress state and successful submission regression.
- `node tests/payment-api.cjs`: endpoint authentication, fixed prices/return URLs, missing migration, signed webhook failures and retries.
- JavaScript syntax / git diff checks.

SQL and authenticated live behavior have NOT been executed without database access. Remaining unrelated permissive policies and other API endpoints need a separate security review; this is not a claim that the entire site is secure.
