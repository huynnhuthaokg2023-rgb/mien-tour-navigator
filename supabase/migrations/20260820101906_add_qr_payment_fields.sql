/*
# Add QR payment fields to services

## Summary
Adds three columns — `requires_payment`, `price`, `qr_image_url` — to the three
"service" tables that admin can manage: `tours`, `vehicle_partners`, and `guides`.
These let an admin mark a service as paywalled, set a price (default 59.000 VND),
and upload a QR code image that visitors see when they tap "Thanh toán & Mở khóa".

This is UI + storage only at this step — no payment confirmation, no SePay webhook,
no automatic unlock. Visitors see the QR; nothing is unlocked client-side.

## New Columns (added to tours, vehicle_partners, guides)
- `requires_payment` boolean NOT NULL DEFAULT false
  — When true, the public detail page shows a lock overlay instead of the content.
- `price` numeric NOT NULL DEFAULT 59000
  — Price in VND. Default 59.000.
- `qr_image_url` text
  — Signed URL of the QR image uploaded to the existing mien-tour-media bucket.

## Security
No new tables. Existing RLS policies already cover SELECT/UPDATE for these tables
(anon reads published rows; admins read/write all rows), so the new columns inherit
those policies automatically. No policy changes needed.

## Notes
1. Uses IF NOT EXISTS so the migration is safe to re-run.
2. No data is lost — columns are additive with safe defaults.
3. QR images are stored in the existing `mien-tour-media` storage bucket; only the
   resulting signed URL is persisted in the database.
*/

ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS requires_payment boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 59000,
  ADD COLUMN IF NOT EXISTS qr_image_url text;

ALTER TABLE public.vehicle_partners
  ADD COLUMN IF NOT EXISTS requires_payment boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 59000,
  ADD COLUMN IF NOT EXISTS qr_image_url text;

ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS requires_payment boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 59000,
  ADD COLUMN IF NOT EXISTS qr_image_url text;
