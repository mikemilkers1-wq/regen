CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Tabellen werden beim ersten API-Aufruf automatisch durch lib/db.js angelegt:
-- campaign_employees, campaign_sessions, movement_applications,
-- campaign_announcements, party_events und state_chapters.
