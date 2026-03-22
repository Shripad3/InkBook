What InkBook Is
A Next.js 16 + Supabase SaaS app where tattoo artists get a personal booking page. Clients book sessions, pay deposits, sign consent forms, and submit healed photos — all automated.

Tech Stack
Layer	Technology
Framework	Next.js 16.2 (App Router)
Language	TypeScript 5
Database	Supabase (PostgreSQL + Auth + Storage)
Payments	Stripe (deposits via Connect + subscriptions)
Email	Resend
SMS	Twilio
Styling	Tailwind CSS + Shadcn/Radix UI
State	Zustand
Validation	Zod + React Hook Form
Hosting	Vercel
Folder Structure

src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing page (€29/€59/€89)
│   ├── sign-in/ & sign-up/         # Auth pages
│   ├── onboarding/                 # Setup wizard (4 steps)
│   ├── book/[slug]/                # PUBLIC booking pages
│   │   ├── page.tsx                # Artist profile + booking wizard
│   │   ├── confirm/page.tsx        # Shows deposit amount before payment
│   │   └── success/page.tsx        # Post-booking confirmation
│   ├── consent/[token]/page.tsx    # Client signs consent form (no login)
│   ├── healed/[token]/page.tsx     # Client uploads healed photos (no login)
│   ├── dashboard/                  # ARTIST-ONLY (protected)
│   │   ├── page.tsx                # Stats overview
│   │   ├── bookings/               # Booking table + detail view
│   │   ├── calendar/               # Week view calendar
│   │   ├── clients/                # Client database
│   │   ├── settings/               # Profile, availability, session types, notifications
│   │   └── billing/                # Subscription management
│   └── api/
│       ├── bookings/               # Create booking, fetch booking
│       ├── checkout/               # Stripe checkout session
│       ├── consent/[token]/        # Verify/sign consent + generate PDF
│       ├── healed/[token]/         # Submit healed photos
│       ├── stripe/connect/         # Create Stripe Express account
│       ├── stripe/portal/          # Subscription management portal
│       ├── stripe/subscription/    # Create subscription checkout
│       ├── webhooks/stripe/        # Handle Stripe events
│       ├── upload/                 # Generate signed Supabase upload URLs
│       └── cron/notifications/     # Send pending notifications (runs daily)
├── components/
│   ├── booking/                    # BookingWizard, SessionTypePicker, DateTimePicker, BookingForm
│   ├── onboarding/                 # OnboardingWizard, StepProfile, StepSessionTypes, StepAvailability, StepStripeConnect
│   ├── bookings/                   # BookingActions, StatusBadge
│   ├── layout/                     # DashboardSidebar, DashboardTopbar
│   └── ui/                         # Shadcn components (button, card, input, etc.)
├── lib/
│   ├── supabase/client.ts          # Browser Supabase client
│   ├── supabase/server.ts          # Server-side Supabase client (SSR)
│   ├── supabase/admin.ts           # Service role client (bypasses RLS)
│   ├── supabase/storage.ts         # Signed URL generation
│   ├── stripe/client.ts            # Stripe SDK
│   ├── stripe/webhooks.ts          # Webhook event handlers
│   ├── resend/client.ts            # Email client
│   ├── resend/templates/           # Email templates (React Email components)
│   ├── twilio/                     # SMS sending
│   ├── pdf/                        # Consent PDF generation
│   └── utils/
│       ├── tokens.ts               # HMAC token generation (consent/healed links)
│       ├── date.ts                 # Timezone-aware date formatting
│       ├── currency.ts             # EUR formatting
│       └── cn.ts                   # Tailwind class merging
├── store/
│   ├── bookingStore.ts             # Booking wizard state (Zustand)
│   └── onboardingStore.ts          # Onboarding wizard state (Zustand)
└── types/database.ts               # TypeScript types for all DB tables
Database Tables
artists
The core user record. Every signed-up artist has one.


id, user_id (auth), slug, name, bio, instagram_handle, studio_name,
style_tags[], stripe_account_id, stripe_customer_id,
subscription_plan (solo/studio/studio_pro), subscription_status,
trial_ends_at, timezone, completed_onboarding_at, created_at
working_hours
When the artist is available each day.


id, artist_id, day_of_week (0-6), start_time, end_time, is_available
UNIQUE(artist_id, day_of_week)
session_types
Services the artist offers (e.g. "Half-day Session", "Cover-up").


id, artist_id, name, duration_minutes, buffer_minutes,
price_from, price_to, deposit_type (fixed/percentage), deposit_value,
requires_consultation, requires_reference_image,
min_notice_hours, max_advance_days, description, is_active
clients
Identified by email. Shared across artists.


id, email (UNIQUE), first_name, last_name, phone,
is_no_show_flagged, no_show_count
bookings
The main table. ~70 fields.


id, artist_id, client_id, session_type_id,
starts_at, ends_at, status (pending_deposit/confirmed/completed/cancelled/no_show),
placement, size_estimate, style_description, is_coverup,
medical_notes, client_notes, artist_notes,
deposit_amount, deposit_paid_at, balance_amount, balance_paid_at,
stripe_payment_intent_id, stripe_transfer_id,
consent_token, consent_signed_at, consent_pdf_url,
healed_photo_token, healed_photos_submitted_at,
cancellation_policy_agreed, age_confirmed
reference_images

id, booking_id, storage_path, uploaded_at
healed_photos

id, booking_id, artist_id, storage_path, uploaded_at
portfolio_images

id, artist_id, storage_path, display_order, uploaded_at
notification_log
Queue for all automated notifications (processed by cron).


id, booking_id, type, channel (email/sms), status (pending/sent/failed),
scheduled_for, sent_at, error_message
Notification types: booking_created, deposit_paid_client, deposit_paid_artist, prep_reminder_48h, consent_reminder_24h, sms_24h, sms_3h, aftercare, healed_photo_request

Key Flows
Client Books a Tattoo
Goes to /book/[artist-slug]
Picks session type → date/time → fills out form (placement, size, style, reference images)
POST /api/bookings → creates booking with status: pending_deposit, schedules notifications
Redirected to /book/[slug]/confirm → shows deposit amount
Pays via Stripe Checkout (POST /api/checkout)
Stripe webhook fires → booking → confirmed, notifications scheduled
Redirected to /book/[slug]/success
Automated Notifications (Cron)
/api/cron/notifications runs daily (Vercel hobby plan limitation). It queries notification_log for status = pending and scheduled_for <= now, then:

Sends email via Resend or SMS via Twilio
Updates status to sent or failed
Consent Form
Sent automatically at 48h before appointment
Link: /consent/[HMAC-token] (7-day expiry, no login needed)
Client fills 10-clause legal form, types name as signature
POST /api/consent/[token] → saves signature, generates PDF
PDF stored in Supabase consent-pdfs bucket, URL saved to booking
Healed Photos
Sent 8 weeks after appointment
Link: /healed/[HMAC-token]
Client uploads up to 5 photos (compressed client-side)
Stored in healed-photos bucket, linked to booking
Authentication & Authorization
Auth provider: Supabase Auth (email/password)
Middleware (middleware.ts): Protects /dashboard and /onboarding. Redirects unauthenticated → /sign-in, authenticated on auth pages → /dashboard
RLS (Row Level Security): All tables restrict access to the artist's own data via get_artist_id() helper function
Service role key: Used in API routes to bypass RLS when needed (e.g. reading client records)
Payments
Deposits (Per Booking)
Calculated at booking time: fixed amount OR % of session price
No-show flagged clients always pay 50%
InkBook takes 2% platform fee
Remaining funds transfer to artist's Stripe Express account
Subscriptions
Plan	Price	Limits
Solo	€29/mo	50 bookings/month
Studio	€59/mo	Unlimited, multi-artist
Studio Pro	€89/mo	Unlimited + custom domain + API + white-label
New artists get 14-day free trial
Subscription status: trial → active → past_due → cancelled/paused
State Management
Booking Wizard (src/store/bookingStore.ts):

step, selectedSessionType, selectedDate, selectedSlot, bookingId, depositAmount
Onboarding Wizard (src/store/onboardingStore.ts):

step, profile fields, sessionTypesAdded, availabilityAdded, stripeConnected
Validation (Zod Schemas)
src/lib/validations/auth.ts — Email + password rules (8+ chars, uppercase, number)
src/lib/validations/booking.ts — Full booking form (name, email, phone, placement, size, style description 10+ chars, policy agreement)
src/lib/validations/sessionType.ts — Session type settings
Supabase Storage Buckets
Bucket	Purpose
reference-images	Client tattoo reference photos
healed-photos	Healed photo follow-ups
portfolio	Artist portfolio
consent-pdfs	Signed consent form PDFs
Access via 7-day signed URLs generated by src/lib/supabase/storage.ts.

Token System (src/lib/utils/tokens.ts)
HMAC-SHA256 tokens embed expiry timestamps. Used for:

Consent form links (7-day expiry)
Healed photo request links (7-day expiry)
Timing-safe verification to prevent timing attacks
Environment Variables You Need to Know

NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # Server-only, bypasses RLS

STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_SOLO_PRICE_ID / STRIPE_STUDIO_PRICE_ID / STRIPE_STUDIO_PRO_PRICE_ID

RESEND_API_KEY
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER

NEXT_PUBLIC_APP_URL                # e.g. https://inkbook.io
CRON_SECRET                        # Protects /api/cron/notifications
TOKEN_SECRET                       # HMAC secret for consent/healed tokens
Important Gotchas
RLS is enabled everywhere — always use admin.ts client in API routes when querying across users
Cron runs daily (Vercel hobby plan limitation) — reminders may be up to 24h late
Stripe Connect required before clients can pay deposits — enforced in onboarding step 4
No-show clients are auto-flagged and charged 50% deposit regardless of session type settings
Consent/healed tokens expire after 7 days — if expired, client needs artist to resend manually
Storage buckets must be created manually in Supabase dashboard — not in migrations
Dark theme is global — dark class applied at the html element level