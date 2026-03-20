-- ============================================================
-- InkBook — Initial Schema
-- Run this in your Supabase SQL editor or via: supabase db push
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE subscription_plan AS ENUM ('solo', 'studio', 'studio_pro');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'paused');
CREATE TYPE booking_status AS ENUM (
  'pending_deposit',
  'confirmed',
  'completed',
  'cancelled_artist',
  'cancelled_client',
  'no_show'
);
CREATE TYPE deposit_type AS ENUM ('fixed', 'percentage');
CREATE TYPE notification_channel AS ENUM ('email', 'sms');
CREATE TYPE notification_type AS ENUM (
  'booking_created',
  'deposit_paid_client',
  'deposit_paid_artist',
  'prep_reminder_48h',
  'consent_reminder_24h',
  'sms_24h',
  'sms_3h',
  'aftercare',
  'healed_photo_request'
);
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  phone           TEXT,
  is_no_show_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  no_show_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE artists (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug                    TEXT UNIQUE NOT NULL,
  name                    TEXT,
  bio                     TEXT,
  instagram_handle        TEXT,
  studio_name             TEXT,
  style_tags              TEXT[] DEFAULT '{}',
  stripe_account_id       TEXT,
  stripe_customer_id      TEXT,
  subscription_plan       subscription_plan,
  subscription_status     subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at           TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  timezone                TEXT NOT NULL DEFAULT 'Europe/Dublin',
  completed_onboarding_at TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user UNIQUE (user_id)
);

CREATE TABLE working_hours (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id     UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT unique_artist_day UNIQUE (artist_id, day_of_week)
);

CREATE TABLE session_types (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id                 UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  duration_minutes          INTEGER NOT NULL CHECK (duration_minutes > 0),
  buffer_minutes            INTEGER NOT NULL DEFAULT 15 CHECK (buffer_minutes >= 0),
  price_from                NUMERIC(10,2),
  price_to                  NUMERIC(10,2),
  deposit_type              deposit_type NOT NULL DEFAULT 'fixed',
  deposit_value             NUMERIC(10,2) NOT NULL DEFAULT 0,
  requires_consultation     BOOLEAN NOT NULL DEFAULT FALSE,
  requires_reference_image  BOOLEAN NOT NULL DEFAULT FALSE,
  min_notice_hours          INTEGER NOT NULL DEFAULT 24,
  max_advance_days          INTEGER NOT NULL DEFAULT 90,
  description               TEXT,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blocked_times (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id   UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_range CHECK (ends_at > starts_at)
);

CREATE TABLE bookings (
  id                            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id                     UUID NOT NULL REFERENCES artists(id) ON DELETE RESTRICT,
  session_type_id               UUID NOT NULL REFERENCES session_types(id) ON DELETE RESTRICT,
  client_id                     UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  starts_at                     TIMESTAMPTZ NOT NULL,
  ends_at                       TIMESTAMPTZ NOT NULL,
  status                        booking_status NOT NULL DEFAULT 'pending_deposit',
  placement                     TEXT,
  size_estimate                 TEXT,
  style_description             TEXT,
  is_coverup                    BOOLEAN NOT NULL DEFAULT FALSE,
  coverup_description           TEXT,
  medical_notes                 TEXT,
  deposit_amount                NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit_paid                  BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_payment_intent_id     TEXT,
  balance_amount                NUMERIC(10,2),
  balance_paid                  BOOLEAN NOT NULL DEFAULT FALSE,
  consent_form_sent_at          TIMESTAMPTZ,
  consent_form_signed_at        TIMESTAMPTZ,
  consent_form_pdf_url          TEXT,
  artist_notes                  TEXT,
  aftercare_sent_at             TIMESTAMPTZ,
  healed_photo_request_sent_at  TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_range CHECK (ends_at > starts_at)
);

CREATE TABLE reference_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE healed_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE portfolio_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id     UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  channel       notification_channel NOT NULL,
  scheduled_for TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  status        notification_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_slug ON artists(slug);
CREATE INDEX idx_bookings_artist_id ON bookings(artist_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_starts_at ON bookings(starts_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_blocked_times_artist_id ON blocked_times(artist_id);
CREATE INDEX idx_blocked_times_range ON blocked_times USING GIST (tstzrange(starts_at, ends_at));
CREATE INDEX idx_bookings_range ON bookings USING GIST (tstzrange(starts_at, ends_at));
CREATE INDEX idx_notification_log_scheduled ON notification_log(scheduled_for)
  WHERE sent_at IS NULL;
CREATE INDEX idx_notification_log_booking ON notification_log(booking_id);
CREATE INDEX idx_working_hours_artist_id ON working_hours(artist_id);
CREATE INDEX idx_session_types_artist_id ON session_types(artist_id);
CREATE INDEX idx_portfolio_images_artist_id ON portfolio_images(artist_id, display_order);
CREATE INDEX idx_reference_images_booking_id ON reference_images(booking_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE healed_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Helper: get current artist's id
CREATE OR REPLACE FUNCTION get_artist_id()
RETURNS UUID AS $$
  SELECT id FROM artists WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ARTISTS
CREATE POLICY "artists_select_own" ON artists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "artists_insert_own" ON artists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "artists_update_own" ON artists FOR UPDATE USING (user_id = auth.uid());
-- Public read for completed (bookable) artist profiles
CREATE POLICY "artists_select_public" ON artists FOR SELECT
  USING (completed_onboarding_at IS NOT NULL);

-- WORKING HOURS
CREATE POLICY "wh_all_own" ON working_hours FOR ALL USING (artist_id = get_artist_id());
CREATE POLICY "wh_select_public" ON working_hours FOR SELECT USING (TRUE);

-- SESSION TYPES
CREATE POLICY "st_all_own" ON session_types FOR ALL USING (artist_id = get_artist_id());
CREATE POLICY "st_select_public" ON session_types FOR SELECT USING (is_active = TRUE);

-- BLOCKED TIMES
CREATE POLICY "bt_all_own" ON blocked_times FOR ALL USING (artist_id = get_artist_id());

-- BOOKINGS (insert handled by service role in API routes)
CREATE POLICY "bookings_select_own" ON bookings FOR SELECT
  USING (artist_id = get_artist_id());
CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE
  USING (artist_id = get_artist_id());

-- CLIENTS
CREATE POLICY "clients_select_own" ON clients FOR SELECT
  USING (id IN (SELECT client_id FROM bookings WHERE artist_id = get_artist_id()));
CREATE POLICY "clients_update_own" ON clients FOR UPDATE
  USING (id IN (SELECT client_id FROM bookings WHERE artist_id = get_artist_id()));

-- REFERENCE IMAGES
CREATE POLICY "ref_images_select_own" ON reference_images FOR SELECT
  USING (booking_id IN (SELECT id FROM bookings WHERE artist_id = get_artist_id()));

-- HEALED PHOTOS
CREATE POLICY "healed_select_own" ON healed_photos FOR SELECT
  USING (booking_id IN (SELECT id FROM bookings WHERE artist_id = get_artist_id()));

-- PORTFOLIO
CREATE POLICY "portfolio_all_own" ON portfolio_images FOR ALL
  USING (artist_id = get_artist_id());
CREATE POLICY "portfolio_select_public" ON portfolio_images FOR SELECT USING (TRUE);

-- NOTIFICATION LOG
CREATE POLICY "notif_select_own" ON notification_log FOR SELECT
  USING (booking_id IN (SELECT id FROM bookings WHERE artist_id = get_artist_id()));

-- ============================================================
-- STORAGE BUCKETS
-- Run these separately in Supabase dashboard > SQL Editor
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('reference-images', 'reference-images', false),
--   ('healed-photos', 'healed-photos', false),
--   ('portfolio', 'portfolio', false),
--   ('consent-pdfs', 'consent-pdfs', false)
-- ON CONFLICT (id) DO NOTHING;
