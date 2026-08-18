PRAGMA foreign_keys = ON;

-- Submitted forms become operational records after the customer completes
-- them. These fields let staff review and progress each record independently
-- from the enquiry that originally prompted it.
ALTER TABLE form_submissions
  ADD COLUMN workflow_status TEXT NOT NULL DEFAULT 'received'
  CHECK (workflow_status IN (
    'received', 'reviewed', 'ready to schedule', 'scheduled',
    'approved', 'active', 'return due', 'complete', 'cancelled'
  ));

ALTER TABLE form_submissions ADD COLUMN due_at TEXT;
ALTER TABLE form_submissions ADD COLUMN reviewed_at TEXT;
ALTER TABLE form_submissions
  ADD COLUMN reviewed_by TEXT REFERENCES staff_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_workflow
  ON form_submissions(form_slug, workflow_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_due
  ON form_submissions(due_at, workflow_status);
