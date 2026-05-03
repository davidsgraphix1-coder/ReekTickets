-- Remove the foreign key constraint on events.organizer to allow flexible event creation
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_organizer_fkey;

-- Allow organizer to be null
ALTER TABLE events
  ALTER COLUMN organizer DROP NOT NULL;