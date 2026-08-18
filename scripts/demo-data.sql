PRAGMA foreign_keys = ON;

-- Re-runnable fictional dataset for client demonstrations. Every row uses a
-- demo-prefixed ID, an example.invalid email address and an obviously fake
-- phone number. Run scripts/remove-demo-data.sql to remove all of it.

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

INSERT INTO organisations (id, name, phone, email, address, created_at, updated_at)
VALUES
  ('demo-org-pacific', 'Demo — Pacific Studios', NULL, NULL, 'Mackay QLD 4740', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('demo-org-stage', 'Demo — Harbour Stage Productions', NULL, NULL, 'Mackay QLD 4740', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('demo-org-fitness', 'Demo — Coral Coast Fitness', NULL, NULL, 'Mackay QLD 4740', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('demo-org-tour', 'Demo — North Queensland Tour Catering', NULL, NULL, 'Mackay QLD 4740', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

INSERT INTO contacts
  (id, organisation_id, name, email, phone, normalised_email, normalised_phone, notes, created_at, updated_at)
VALUES
  ('demo-contact-margot', 'demo-org-pacific', 'Margot Robbie', 'margot.robbie@example.invalid', '0000 000 001', 'margot.robbie@example.invalid', '0000000001', 'Fictional demonstration record.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('demo-contact-hugh', 'demo-org-stage', 'Hugh Jackman', 'hugh.jackman@example.invalid', '0000 000 002', 'hugh.jackman@example.invalid', '0000000002', 'Fictional demonstration record.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('demo-contact-chris', 'demo-org-fitness', 'Chris Hemsworth', 'chris.hemsworth@example.invalid', '0000 000 003', 'chris.hemsworth@example.invalid', '0000000003', 'Fictional demonstration record.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('demo-contact-kylie', 'demo-org-tour', 'Kylie Minogue', 'kylie.minogue@example.invalid', '0000 000 004', 'kylie.minogue@example.invalid', '0000000004', 'Fictional demonstration record.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

INSERT INTO enquiries
  (id, contact_id, source, service, message, location, urgency, status, owner_id, created_at, updated_at)
VALUES
  ('demo-enquiry-margot', 'demo-contact-margot', 'website', 'Commercial refrigeration', 'Fictional demo: cool-room inspection before a studio production.', 'Mackay', 'standard', 'new', NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')),
  ('demo-enquiry-hugh', 'demo-contact-hugh', 'phone', 'Air conditioning', 'Fictional demo: assess backstage air conditioning before an event.', 'Mackay', 'urgent', 'triaged', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 hours')),
  ('demo-enquiry-chris', 'demo-contact-chris', 'phone', 'Portable air-conditioner hire', 'Fictional demo: portable cooling for a weekend fitness event.', 'Mackay', 'standard', 'awaiting customer details', NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days')),
  ('demo-enquiry-kylie', 'demo-contact-kylie', 'staff', 'Cold room hire', 'Fictional demo: temporary cold-room hire for tour catering.', 'Mackay Showgrounds', 'standard', 'booked', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'));

INSERT INTO form_invites
  (id, form_slug, contact_id, enquiry_id, token_hash, sent_by, expires_at, completed_at, revoked_at, created_at)
VALUES
  ('demo-invite-margot-service', 'service-supply', 'demo-contact-margot', 'demo-enquiry-margot', 'demo-token-margot-service', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+8 days'), NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')),
  ('demo-invite-chris-hire', 'hire-contract', 'demo-contact-chris', 'demo-enquiry-chris', 'demo-token-chris-hire', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+10 days'), NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days')),
  ('demo-invite-hugh-service', 'service-supply', 'demo-contact-hugh', 'demo-enquiry-hugh', 'demo-token-hugh-service', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+9 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 hours'), NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')),
  ('demo-invite-kylie-hire', 'hire-contract', 'demo-contact-kylie', 'demo-enquiry-kylie', 'demo-token-kylie-hire', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+11 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'), NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days'));

INSERT INTO form_submissions
  (id, form_slug, form_version, form_snapshot, values_json, contact_id, enquiry_id, invite_id, source, ip_hash, user_agent, created_at, workflow_status, due_at, reviewed_at, reviewed_by)
VALUES
  (
    'demo-submission-hugh-service', 'service-supply', 'demo-2026-08-18',
    '{"title":"Service supply form","sections":[{"title":"Customer details","fields":[{"id":"full_name","label":"Full name","type":"text"},{"id":"company","label":"Company or trading name","type":"text"},{"id":"email","label":"Email","type":"email"},{"id":"phone","label":"Phone","type":"tel"}]},{"title":"Service site","fields":[{"id":"site_address","label":"Service address","type":"textarea"},{"id":"site_contact","label":"On-site contact","type":"text"},{"id":"access_notes","label":"Access, safety or site notes","type":"textarea"}]},{"title":"Work required","fields":[{"id":"service_type","label":"Service type","type":"select","options":[{"label":"Inspection or quote","value":"inspection"}]},{"id":"equipment_details","label":"Equipment and issue details","type":"textarea"},{"id":"requested_date","label":"Preferred service date","type":"date"},{"id":"urgent","label":"Is this urgent?","type":"radio","options":[{"label":"Yes — the business or stock is at risk","value":"yes"},{"label":"No — a standard appointment is fine","value":"no"}]}]}]}',
    '{"full_name":"Hugh Jackman","company":"Demo — Harbour Stage Productions","email":"hugh.jackman@example.invalid","phone":"0000 000 002","site_address":"Backstage loading dock, Demo Theatre, Mackay QLD 4740","site_contact":"Demo venue manager — no real contact","access_notes":"Fictional demo: access after 10 am; sign in at stage door.","service_type":"inspection","equipment_details":"Fictional demo: inspect two split systems serving backstage dressing rooms.","requested_date":"2026-08-25","urgent":"yes"}',
    'demo-contact-hugh', 'demo-enquiry-hugh', 'demo-invite-hugh-service', 'invite', NULL, 'Mackay CRM fictional demo seed', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 hours'), 'received', NULL, NULL, NULL
  ),
  (
    'demo-submission-kylie-hire', 'hire-contract', 'demo-2026-08-18',
    '{"title":"Equipment hire agreement","sections":[{"title":"Equipment being hired","fields":[{"id":"equipment","label":"Equipment","type":"checkbox","options":[{"label":"Cold Room","value":"cold-room"},{"label":"Freezer Room","value":"freezer-room"},{"label":"Portable Air-Conditioner","value":"portable-air-conditioner"}]}]},{"title":"Hire details","fields":[{"id":"hire_date","label":"Date of hire beginning","type":"date"},{"id":"hire_location","label":"Where will the equipment be used?","type":"textarea"}]},{"title":"Customer details","fields":[{"id":"hirer_name","label":"Full name","type":"text"},{"id":"hirer_company","label":"Company name","type":"text"},{"id":"hirer_email","label":"Email","type":"email"},{"id":"hirer_phone","label":"Phone","type":"tel"},{"id":"drivers_licence","label":"Driver license number","type":"text"}]},{"title":"Terms acceptance","fields":[{"id":"accept_return","label":"Return equipment clean and in good repair","type":"acceptance"},{"id":"accept_loss","label":"Responsible for loss or theft","type":"acceptance"},{"id":"accept_use","label":"Use equipment safely","type":"acceptance"},{"id":"accept_payment","label":"Pay agreed hire charges","type":"acceptance"},{"id":"acceptance_name","label":"Accepted by","type":"text"}]}]}',
    '{"equipment":["cold-room"],"hire_date":"2026-08-20","hire_location":"Catering compound, Demo Showgrounds, Mackay QLD 4740","hirer_name":"Kylie Minogue","hirer_company":"Demo — North Queensland Tour Catering","hirer_email":"kylie.minogue@example.invalid","hirer_phone":"0000 000 004","drivers_licence":"DEMO-NOT-A-REAL-LICENCE","accept_return":"yes","accept_loss":"yes","accept_use":"yes","accept_payment":"yes","acceptance_name":"Kylie Minogue (fictional demo)"}',
    'demo-contact-kylie', 'demo-enquiry-kylie', 'demo-invite-kylie-hire', 'invite', NULL, 'Mackay CRM fictional demo seed', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'), 'active', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+5 days'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-20 hours'), (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1)
  );

INSERT INTO tasks
  (id, contact_id, enquiry_id, assignee_id, title, due_at, completed_at, created_at, updated_at)
VALUES
  ('demo-task-kylie-return', 'demo-contact-kylie', 'demo-enquiry-kylie', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), 'Confirm demo cold-room return arrangements', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+4 days'), NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

INSERT INTO activity_events
  (id, contact_id, enquiry_id, actor_id, event_type, summary, metadata_json, created_at)
VALUES
  ('demo-activity-margot-enquiry', 'demo-contact-margot', 'demo-enquiry-margot', NULL, 'enquiry_created', 'Demo website enquiry received', '{"demo":true}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 days')),
  ('demo-activity-margot-form', 'demo-contact-margot', 'demo-enquiry-margot', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), 'form_invited', 'Service supply form sent (demo)', '{"demo":true}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')),
  ('demo-activity-hugh-submission', 'demo-contact-hugh', 'demo-enquiry-hugh', NULL, 'form_submitted', 'Service supply form submitted (demo)', '{"demo":true,"submissionId":"demo-submission-hugh-service"}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 hours')),
  ('demo-activity-chris-form', 'demo-contact-chris', 'demo-enquiry-chris', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), 'form_invited', 'Hire contract sent (demo)', '{"demo":true}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days')),
  ('demo-activity-kylie-active', 'demo-contact-kylie', 'demo-enquiry-kylie', (SELECT id FROM staff_users WHERE active = 1 ORDER BY CASE WHEN email = 'service@mackayrefrig.com.au' THEN 0 ELSE 1 END, created_at LIMIT 1), 'form_workflow_updated', 'Hire contract moved to Active (demo)', '{"demo":true,"submissionId":"demo-submission-kylie-hire"}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-20 hours'));
