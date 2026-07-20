# Features and 1.0 Scope

Dieses Dokument beschreibt den aktuellen Feature-Stand und die geplanten Features bis `v1.0`.
Ziel ist eine klare Priorisierung: Was muss vor 1.0 zwingend fertig sein, was ist wichtig, aber nachrangig, und was ist optional.

## Status-Legende

- `Live`: Bereits produktiv nutzbar
- `In Arbeit`: Teilweise umgesetzt, noch nicht stabil oder unvollstaendig
- `Geplant`: Noch nicht implementiert

## Bereits vorhandene Kernfeatures (`Live`)

### Oeffentliche Website
- Programmseite mit aktuellen Vorstellungen
- Content-Seiten per Block-System (Hero, Markdown, Grid, Split, Bild etc.)
- Theme-faehige Seiten (z. B. Programm/Sommerkino)
- SEO- und Discovery-Feeds (`/rss.xml`, `/sitemap.xml`, iCal)

### Admin-CMS
- Login-geschuetzter Adminbereich
- Filmverwaltung (Anlegen, Bearbeiten, Loeschen, Sortieren)
- Programmverwaltung (Eintraege verwalten, sortieren, importieren/exportieren)
- Seiten-, Navigation- und Footer-Verwaltung

### Plattform-Basis
- Nuxt 4 + TypeScript + Prisma/PostgreSQL
- Security-Header-Middleware
- Seed-/Default-Content-Unterstuetzung

## 1.0 Must-have (`P0`)

Diese Punkte sind Release-Blocker fuer `v1.0`.

### 1) API-Token-System fuer externe Zugriffe
`Status: Geplant`

**Ziel**
- Personengebundene API-Tokens fuer Automationen und externe Integrationen.

**Anforderungen**
- Token gehoert immer genau einem Benutzerkonto.
- Token uebernimmt exakt die Berechtigungen des Benutzers (keine Sonderrechte).
- Token kann im Admin erstellt, benannt, deaktiviert und widerrufen werden.
- Auth via Header (`Authorization: Bearer <token>` oder `X-Auth-Token`, final festlegen).
- Token-Werte werden nur gehasht gespeichert, nie im Klartext.

**Definition of Done**
- Admin-UI fuer Token-Lifecycle vorhanden.
- Server akzeptiert Token fuer freigegebene Endpunkte.
- Rechtepruefung und Revocation sind getestet.

### 2) Kassen-/Store-Konsistenz bei paralleler Nutzung
`Status: In Arbeit`

**Ziel**
- Nummernkreise und Bons bleiben bei mehreren offenen Kassen-Sessions konsistent.

**Anforderungen**
- Frontend synchronisiert Bon-Nummern und Counter regelmaessig.
- Sichtbares Handling fuer Konflikte (z. B. veralteter Stand, erneutes Laden).
- Keine stillen Ueberschreibungen bei konkurrierenden Aktionen.

**Definition of Done**
- Reproduzierbare Mehrclient-Szenarien getestet.
- Kein doppelter Bon und kein verlorener Nummernsprung.

### 3) Footer-Editor: Reihenfolge veraenderbar
`Status: Geplant`

**Ziel**
- Footer-Eintraege im Admin sortierbar machen (Drag-and-drop oder Move-Buttons).

**Anforderungen**
- Reihenfolge wird persistent gespeichert.
- Keyboard- und Screenreader-kompatible Bedienung.

**Definition of Done**
- Redakteur kann Reihenfolge ohne manuelle JSON-/DB-Eingriffe aendern.

### 4) Nutzerkonto: E-Mail-Adresse aendern
`Status: Geplant`

**Ziel**
- Benutzer koennen ihre E-Mail im Account-Bereich sicher aktualisieren.

**Anforderungen**
- Eindeutigkeitspruefung auf neue E-Mail.
- Optional: bestaetigungsbasierter Wechsel (Double-Opt-In, falls Mailversand verfuegbar).
- Session-/Login-Verhalten nach Aenderung klar definiert.

**Definition of Done**
- E-Mail-Aenderung funktioniert robust inklusive Fehlerfaelle (bereits vergeben, invalide Adresse).

### 5) Changelog im Admin sichtbar
`Status: Geplant`

**Ziel**
- Aenderungen fuer das Team direkt in `/admin` einsehbar machen.

**Anforderungen**
- Anzeige der letzten Releases inkl. Datum und Kurzbeschreibung.
- Datenquelle: `public/CHANGELOG.md`.

**Definition of Done**
- Redaktions-/Admin-Team kann Neuerungen ohne Repo-Zugriff im Admin lesen.

## 1.0 Soll-Features (`P1`)

Diese Punkte sollten fuer ein starkes 1.0 moeglichst enthalten sein, sind aber keine harten Blocker.

### 1) Medienverwaltung robuster machen
`Status: In Arbeit`

- Asset-Liste mit Suche/Filter, Dateigroesse, Referenzhinweisen.
- Sichere Loeschlogik (nicht loeschen, wenn noch verwendet).

### 2) Berechtigungsmodell und Rollen-Dokumentation schaerfen
`Status: In Arbeit`

- Klar dokumentierte Rechte pro Rolle.
- Kritische Admin-Aktionen serverseitig einheitlich abgesichert.

### 3) Qualitaetssicherung fuer zentrale Flows
`Status: Geplant`

- Smoke-Tests fuer: Login, Film anlegen, Programm-Eintrag speichern, Seite publizieren.
- Mindestens ein E2E-Flow fuer den wichtigsten Admin-Pfad.

### 4) Observability-Basis
`Status: Geplant`

- Strukturierte Fehlerlogs fuer API-Routen.
- Health-Checks und nachvollziehbare Fehlermeldungen fuer Admin-Workflows.

## Post-1.0 / Nice-to-have (`P2`)

- Vorschau-/Review-Workflow fuer Content-Aenderungen (vor Live-Schaltung).
- Audit-Log fuer relevante Admin-Aktionen.
- Erweiterte Analytics fuer Programmentscheidungen.

## Offene Produktentscheidungen (vor 1.0 klaeren)

1. API-Header-Standard fuer Tokens (`Authorization` vs. `X-Auth-Token`).
2. Ob Footer-Sortierung per Drag-and-drop oder mit Move-Buttons umgesetzt wird.
3. Welche Tests fuer 1.0 als Mindestabdeckung verpflichtend sind.

## Vorschlag fuer naechste Iteration

1. `P0` in Umsetzungspakete schneiden (Token, Footer-Sortierung, Konto-E-Mail, Changelog-View).
2. Pro Paket je 1 Owner, 1 Zieltermin und 1 Abnahmekriterium festlegen.
3. Danach `P1`-Themen in den ersten 1.0.x-Zyklus planen.