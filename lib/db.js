const { neon } = require('@neondatabase/serverless');
let initialized=false;
function sql(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL ist nicht konfiguriert.');return neon(process.env.DATABASE_URL)}
async function ensureSchema(){if(initialized)return;const q=sql();await q`CREATE EXTENSION IF NOT EXISTS pgcrypto`;await q`CREATE TABLE IF NOT EXISTS campaign_employees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('manager','employee')), active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;await q`CREATE TABLE IF NOT EXISTS campaign_sessions (token_hash TEXT PRIMARY KEY, employee_id UUID NOT NULL REFERENCES campaign_employees(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;await q`CREATE TABLE IF NOT EXISTS movement_applications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vorname TEXT NOT NULL, nachname TEXT NOT NULL, email TEXT NOT NULL, ort TEXT NOT NULL, mitarbeit TEXT NOT NULL, mitglied TEXT NOT NULL, nachricht TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','accepted','rejected')), handled_by UUID REFERENCES campaign_employees(id), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;await q`CREATE TABLE IF NOT EXISTS campaign_announcements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, body TEXT NOT NULL, images JSONB NOT NULL DEFAULT '[]'::jsonb, active BOOLEAN NOT NULL DEFAULT TRUE, created_by UUID REFERENCES campaign_employees(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;await q`CREATE TABLE IF NOT EXISTS party_events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
title TEXT NOT NULL,
description TEXT NOT NULL DEFAULT '',
location TEXT NOT NULL,
state_code TEXT NOT NULL DEFAULT '',
starts_at TIMESTAMPTZ NOT NULL,
ends_at TIMESTAMPTZ,
link TEXT NOT NULL DEFAULT '',
created_by UUID REFERENCES campaign_employees(id),
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await q`CREATE TABLE IF NOT EXISTS state_chapters (
code TEXT PRIMARY KEY,
name TEXT UNIQUE NOT NULL,
chairman TEXT NOT NULL DEFAULT '',
deputy TEXT NOT NULL DEFAULT '',
discord TEXT NOT NULL DEFAULT '',
note TEXT NOT NULL DEFAULT '',
updated_by UUID REFERENCES campaign_employees(id),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
const stateSeed=[
['BW','Baden-Württemberg'],['BY','Bayern'],['BE','Berlin'],['BB','Brandenburg'],
['HB','Bremen'],['HH','Hamburg'],['HE','Hessen'],['MV','Mecklenburg-Vorpommern'],
['NI','Niedersachsen'],['NW','Nordrhein-Westfalen'],['RP','Rheinland-Pfalz'],
['SL','Saarland'],['SN','Sachsen'],['ST','Sachsen-Anhalt'],
['SH','Schleswig-Holstein'],['TH','Thüringen']
];
for(const [code,name] of stateSeed){
  await q`INSERT INTO state_chapters (code,name) VALUES (${code},${name}) ON CONFLICT (code) DO NOTHING`;
}
const existingAnnouncement=await q`SELECT id FROM campaign_announcements WHERE active=TRUE LIMIT 1`;if(!existingAnnouncement.length){const defaultImages=JSON.stringify(['https://commons.wikimedia.org/wiki/Special:Redirect/file/C25642-13.jpg']);await q`INSERT INTO campaign_announcements (title,body,images,active) VALUES ('Aus der EVU wird das Republikanische Bündnis.','Mit dem neuen Namen beginnt ein neues Kapitel. BÜNDNIS bringt auf den Punkt, was Regen und Gush aufbauen wollen: eine feste politische Heimat für Menschen, die Freiheit, Ordnung und Verantwortung miteinander verbinden.',CAST(${defaultImages} AS JSONB),TRUE)`};initialized=true}
module.exports={sql,ensureSchema};
