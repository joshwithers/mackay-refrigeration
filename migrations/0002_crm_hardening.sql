PRAGMA foreign_keys = ON;

-- A secure invite is single-use even if two submissions arrive together.
CREATE UNIQUE INDEX IF NOT EXISTS idx_form_submissions_invite_once
  ON form_submissions(invite_id)
  WHERE invite_id IS NOT NULL;

-- Keep the required administrators present in every environment and restore
-- access if a database is rebuilt from migrations.
INSERT INTO staff_users (id, email, name, role, active, created_at, updated_at)
VALUES
  ('staff-service-mackay', 'service@mackayrefrig.com.au', 'Mackay Refrigeration', 'admin', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('staff-josh-withers', 'josh@withers.co', 'Josh Withers', 'admin', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('staff-dennis-beetle', 'dennis@beetledigital.com', 'Dennis (Beetle Digital)', 'admin', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  role = 'admin',
  active = 1,
  updated_at = excluded.updated_at;
