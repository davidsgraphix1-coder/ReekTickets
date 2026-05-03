-- 1) Check current events columns, including the optional publish/draft and organizer fields.
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'events'
  AND table_schema = 'public'
  AND column_name IN (
    'event_link',
    'platform',
    'visibility',
    'password_protected',
    'event_password',
    'recurring_days',
    'published',
    'service_tier',
    'status',
    'organizer'
)
ORDER BY ordinal_position;

-- 2) Add any missing event columns used by event creation and settings.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_link TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS password_protected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_password TEXT,
  ADD COLUMN IF NOT EXISTS recurring_days JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_tier TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 3) Find any events whose organizer does not exist in users.
SELECT e.id AS event_id,
       e.organizer AS organizer_id,
       u.id AS user_id,
       u.email AS user_email
FROM events e
LEFT JOIN users u ON e.organizer = u.id
WHERE e.organizer IS NULL
   OR u.id IS NULL;

-- 4) Create a fallback organizer user if none exists (this will show the organizer ID).
WITH existing_fallback AS (
  SELECT id
  FROM users
  WHERE role IN ('organizer', 'admin')
  ORDER BY created_at ASC
  LIMIT 1
), email_fallback AS (
  SELECT id
  FROM users
  WHERE email = 'fallback-organizer@local'
  LIMIT 1
), inserted_fallback AS (
  INSERT INTO users (id, email, phone, full_name, role, status, created_at, updated_at)
  SELECT gen_random_uuid(), 'fallback-organizer@local', '233000000000', 'Fallback Organizer', 'organizer', 'active', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing_fallback)
    AND NOT EXISTS (SELECT 1 FROM email_fallback)
  RETURNING id
)
SELECT 'Fallback organizer ready - ID: ' || id AS status_message FROM existing_fallback
UNION ALL
SELECT 'Fallback organizer ready - ID: ' || id AS status_message FROM email_fallback
UNION ALL
SELECT 'Created new fallback organizer - ID: ' || id AS status_message FROM inserted_fallback;

-- 5) Repair orphaned events by assigning them to a valid organizer.
UPDATE events
SET organizer = (
  SELECT id
  FROM users
  WHERE role IN ('organizer', 'admin')
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE organizer IS NULL
   OR organizer NOT IN (SELECT id FROM users);

-- 6) Ensure draft events stay unpublished.
UPDATE events
SET published = false
WHERE status = 'draft' AND published = true;

-- 7) Remove the organizer foreign key constraint to allow flexible event creation
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_organizer_fkey;

-- 8) Allow organizer to be null (remove NOT NULL constraint)
ALTER TABLE events
  ALTER COLUMN organizer DROP NOT NULL;

-- 9) Final status check
SELECT 'Schema fix completed successfully!' AS status,
       COUNT(*) AS total_events
FROM events;
