PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS staff_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'readonly')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS login_tokens (
  id TEXT PRIMARY KEY,
  staff_user_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  staff_user_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organisations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  organisation_id TEXT REFERENCES organisations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  normalised_email TEXT,
  normalised_phone TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  source TEXT NOT NULL CHECK (source IN ('website', 'phone', 'staff')),
  service TEXT,
  message TEXT,
  location TEXT,
  urgency TEXT NOT NULL DEFAULT 'standard' CHECK (urgency IN ('standard', 'urgent')),
  status TEXT NOT NULL DEFAULT 'new',
  owner_id TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS form_invites (
  id TEXT PRIMARY KEY,
  form_slug TEXT NOT NULL,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  enquiry_id TEXT REFERENCES enquiries(id) ON DELETE SET NULL,
  token_hash TEXT NOT NULL UNIQUE,
  sent_by TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
  expires_at TEXT NOT NULL,
  completed_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  form_slug TEXT NOT NULL,
  form_version TEXT NOT NULL,
  form_snapshot TEXT NOT NULL,
  values_json TEXT NOT NULL,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  enquiry_id TEXT REFERENCES enquiries(id) ON DELETE SET NULL,
  invite_id TEXT REFERENCES form_invites(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('website', 'invite', 'staff')),
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id) ON DELETE CASCADE,
  enquiry_id TEXT REFERENCES enquiries(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id) ON DELETE CASCADE,
  enquiry_id TEXT REFERENCES enquiries(id) ON DELETE CASCADE,
  assignee_id TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS communications (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  enquiry_id TEXT REFERENCES enquiries(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'email',
  template TEXT,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  subject TEXT NOT NULL,
  text_body TEXT,
  html_body TEXT,
  provider_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL,
  sent_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS communication_events (
  id TEXT PRIMARY KEY,
  communication_id TEXT REFERENCES communications(id) ON DELETE CASCADE,
  provider_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_rules (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(event_type, recipient_email)
);

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id) ON DELETE CASCADE,
  enquiry_id TEXT REFERENCES enquiries(id) ON DELETE CASCADE,
  actor_id TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES staff_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_login_tokens_hash ON login_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_hash ON sessions(session_hash);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(normalised_email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(normalised_phone);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_contact ON enquiries(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invites_hash ON form_invites(token_hash);
CREATE INDEX IF NOT EXISTS idx_submissions_contact ON form_submissions(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_activity_contact ON activity_events(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(completed_at, due_at);
