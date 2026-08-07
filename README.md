# Republikanisches Bündnis · Regen–Gush BÜNDNIS-Kampagne

Mehrseitige Kampagnenwebsite mit einem geschützten Mitarbeiterportal für Vercel und Neon PostgreSQL.

## Enthalten

- Öffentliche Kampagnenwebsite und ausführliches Programm
- Mitmachformular mit zentraler Speicherung
- Mitarbeiterlogin mit HTTP-only-Sitzungscookie
- Interner Bewerbungseingang mit Statusverwaltung
- BÜNDNIS-Manager kann Mitarbeiter- und weitere Managerkonten erstellen
- BÜNDNIS-Manager kann Konten aktivieren und deaktivieren

## Deployment über GitHub und Vercel

1. Den Inhalt dieses Ordners in ein GitHub-Repository hochladen.
2. Das Repository in Vercel importieren.
3. Eine Neon-PostgreSQL-Datenbank erstellen und mit dem Vercel-Projekt verbinden.
4. In Vercel unter **Settings → Environment Variables** setzen:
   - `DATABASE_URL`
   - `CAMPAIGN_MANAGER_USERNAME`
   - `CAMPAIGN_MANAGER_PASSWORD` – ein langes, zufälliges Passwort verwenden
   - `CAMPAIGN_MANAGER_NAME`
5. Neu deployen.
6. `/login.html` öffnen. Beim ersten Login wird das Managerkonto automatisch angelegt.

## Sicherheit

- Passwörter werden mit bcrypt gehasht.
- Sitzungstoken werden nur gehasht in der Datenbank gespeichert.
- Das Browsercookie ist `HttpOnly`, `SameSite=Strict` und in Produktion `Secure`.
- Nur Manager dürfen Mitarbeiterkonten verwalten.

## Lokale Entwicklung

Da die Seite Vercel Functions nutzt, sollte sie mit der Vercel CLI statt durch direktes Öffnen der HTML-Dateien getestet werden:

```bash
npm install
npx vercel dev
```


## Revision
Die öffentliche Website ist nun als Seite der gewählten BÜNDNIS-Doppelspitze gestaltet. Die Startseite enthält eine große Wahlsieg-Darstellung; das Programm wurde stärker an die konservativen Grundsätze der Reagan-Wahlkämpfe 1980 und 1984 angelehnt.


## Bekanntmachungen

BÜNDNIS-Manager können im Mitarbeiterportal eine neue Startseiten-Bekanntmachung mit Überschrift, Text und bis zu fünf Bildern veröffentlichen. Die Bilder werden im Browser verkleinert und in Neon PostgreSQL gespeichert. Die öffentliche Startseite lädt stets die zuletzt veröffentlichte Meldung.


## Pressestelle

`pressestelle.html` enthält die öffentliche Pressemappe. Die ZIP-Datei unter `press-pack/Republikanisches_Buendnis_Press_Pack.zip` bündelt PDFs und Bildmaterial.

## Programm-Rework (August 2026)

`priorities.html` ist jetzt eine bebilderte Themenübersicht. Die ausführlichen
Positionen liegen unter `programm/*.html`. Jedes Themenkapitel enthält ein
festes Themenmenü und aufklappbare Unterpunkte mit ausführlichen Texten.

Die ECR-Party-Zugehörigkeit wird im unteren öffentlichen Seitenbereich gezeigt.

Geburtsjahre der Vorsitzenden in den Presseunterlagen:
- Reinhold Regen: 6. Februar 1957
- Georg B. Gush: 6. Juli 1990

## Parteiführung

Zusätzlich zu den beiden Vorsitzenden ist Micheal Romney als Generalsekretär
auf Startseite, Teamseite und in der Pressemappe aufgenommen. Sein Presseporträt
liegt unter `assets/press/micheal-romney-presseportrait.jpg`.

## Login-Fix

`login.html` und `employee.html` setzen `page-ready` nun selbst. Zusätzlich
erzwingt das Stylesheet für `.login-page` und `.portal-body` Sichtbarkeit.
Damit hängen die internen Seiten nicht mehr von `assets/app.js` ab.

## Neue Parteibereiche

- `aktuelles.html`: aktuelle Bekanntmachung + automatisches Archiv aller früheren Bekanntmachungen
- `termine.html`: öffentliche Veranstaltungen aus Neon
- `vor-ort.html`: klickbare Deutschlandkarte + 16 verwaltbare Landesverbände
- `bundesvorstand.html`: politischer Bundesvorstand
- `parteileitung.html`: Generalsekretär und Kanzlerkandidat Micheal Romney
- `reden.html`: Reden und Auftritte
- `404.html`: gebrandete Fehlerseite

Manager können im Mitarbeiterportal zusätzlich Termine und Landesverbände verwalten.
Die Tabellen `party_events` und `state_chapters` werden automatisch beim ersten API-Aufruf angelegt.

Open-Graph-Metadaten verwenden derzeit `https://regen-alpha.vercel.app` als Basisadresse.
Nach Kauf einer eigenen Domain sollte diese Basisadresse in den HTML-Dateien ersetzt werden.

## Discord-Popup auf allen Seiten

`assets/app.js` erzeugt das Discord-Popup jetzt selbst auf jeder HTML-Seite.
Es erscheint ca. 650 ms nach dem ersten Seitenaufruf in einem Tab. In dem Moment
wird `rbDiscordPromptSeenV3` in `sessionStorage` gesetzt. Beim Wechsel auf andere
Seiten desselben Tabs erscheint es deshalb nicht erneut. Wird der Tab bzw. die
Browsersitzung beendet, wird der Sessionstatus automatisch verworfen.

Zum Testen kann an jede URL `?discord=1` angehängt werden.


## Parteileitung – Dr. Harald Schmidt Kohlb
`parteileitung.html` führt nun Dr. Harald Schmidt Kohlb als Mitglied des Parteivorstands, Bundestagskandidaten und bevorzugten Kandidaten für den Vorsitz einer künftigen BÜNDNIS-Bundestagsfraktion. Sein Profil ist direkt über `parteileitung.html#kohlb` erreichbar.
