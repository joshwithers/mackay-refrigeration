PRAGMA foreign_keys = ON;

-- Remove only the fictional, demo-prefixed records created by demo-data.sql.
DELETE FROM communications WHERE contact_id LIKE 'demo-%' OR enquiry_id LIKE 'demo-%';
DELETE FROM activity_events WHERE id LIKE 'demo-%' OR contact_id LIKE 'demo-%';
DELETE FROM audit_events WHERE entity_id LIKE 'demo-%';
DELETE FROM notes WHERE id LIKE 'demo-%' OR contact_id LIKE 'demo-%';
DELETE FROM tasks WHERE id LIKE 'demo-%' OR contact_id LIKE 'demo-%';
DELETE FROM form_submissions WHERE id LIKE 'demo-%' OR contact_id LIKE 'demo-%';
DELETE FROM form_invites WHERE id LIKE 'demo-%' OR contact_id LIKE 'demo-%';
DELETE FROM enquiries WHERE id LIKE 'demo-%' OR contact_id LIKE 'demo-%';
DELETE FROM contacts WHERE id LIKE 'demo-%';
DELETE FROM organisations WHERE id LIKE 'demo-%';
