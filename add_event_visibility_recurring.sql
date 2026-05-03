ALTER TABLE events
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS password_protected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_password TEXT,
  ADD COLUMN IF NOT EXISTS recurring_days JSONB DEFAULT '[]'::jsonb;
