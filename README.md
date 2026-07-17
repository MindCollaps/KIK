<div align="center">
  <img src="public/favicon.svg" width="72" alt="Kino im Kasten Logo">

  # 🎬 Kino im Kasten

  **Filmkultur in Dresden. Kuratiert von Studierenden.**

  [![Build Docker image](https://github.com/MindCollaps/KIK/actions/workflows/docker-build.yml/badge.svg)](https://github.com/MindCollaps/KIK/actions/workflows/docker-build.yml)
  ![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?logo=postgresql&logoColor=white)
</div>

---

Dies ist der Quellcode der Website von **Kino im Kasten (KiK)**, dem studentischen Programmkino der TU Dresden. Die Seite ist die digitale Anlaufstelle für alles rund ums Kino: das aktuelle Programm, das Sommerkino im Innenhof, Sonderveranstaltungen und alle Infos, die man braucht, um einfach mal vorbeizukommen — egal ob man an der TU studiert oder nicht. 🎟️

## 🍿 Über das Kino

Etwas abseits des TU-Kerngeländes, in der August-Bebel-Straße 20, verwandelt sich ein Hörsaal mit wenigen Handgriffen in ein echtes Kino. Das Gebäude war ursprünglich Teil der NVA-Militärakademie Friedrich Engels — nach der Wende übernahm die TU Dresden den Bau, und im Januar 1993 begann mit *Spiel mir das Lied vom Tod* der offizielle Spielbetrieb. Nach umfangreichen Sanierungsarbeiten ab 2012 feierte das KiK am 16. Mai 2014 seine Wiedereröffnung.

Seitdem läuft der Betrieb ehrenamtlich, getragen vom Verein **Objektiv e.V.** — von Studierenden aus allen Fachrichtungen, ohne Vorwissen oder Zugangsbeschränkung. Der Fokus liegt nicht auf Neuerscheinungen, sondern auf sehenswerten Filmen aus allen Genres und Epochen, ergänzt durch Sonderveranstaltungen wie live vertonte Stummfilmklassiker oder Foren für junge Filmemacher:innen.

Im Sommer zieht das KiK gemeinsam mit dem StuRa als **Sommerkino** in den Innenhof des Fritz-Förster-Baus um — freitagabends, unter freiem Himmel, bei freiem Eintritt.

**Auf einen Blick:**

| | |
|---|---|
| 📍 Ort | Hörsaalzentrum, August-Bebel-Straße 20, 01219 Dresden |
| 🎬 Seit | 1993 |
| 💶 Eintritt | 3 € ermäßigt · 4 € normal · nur Barzahlung |
| ☀️ Sommerkino | Innenhof Fritz-Förster-Bau, freitags, freier Eintritt |
| 🙋 Zugang | Offen für alle — keine TU-Immatrikulation nötig |

## ✨ Features

- 🗓️ **Programmverwaltung** – Vorstellungen mit Zeit, Ort, Preis, Altersfreigabe, Bannerbild und individueller Kartengestaltung (Badges, Rahmen, Farben)
- 🐶 **DoesTheDogDie-Integration** – Filme lassen sich verknüpfen, Community-Inhaltshinweise werden automatisch übernommen
- 🧩 **Seiten-Baukasten** – ein blockbasiertes CMS (Hero, Markdown, Kartenraster, Bilder, Split-Layouts u. v. m.) für alle Unterseiten
- 🎨 **Seiten-Themes** – jede Seite kann ein eigenes visuelles Thema bekommen (z. B. Sommerkino, Das Kino, Glow)
- 🔐 **Admin-Bereich** – Login-geschütztes Verwaltungspanel für Programm, Seiten, Navigation und Footer
- 📡 **Feeds** – automatisch generiertes iCal-, RSS- und Sitemap-Feed fürs Programm
- ♿ **Barrierearm** – Tastaturbedienung, Kontraste nach WCAG AA und `prefers-reduced-motion`-Unterstützung

## 🧱 Tech-Stack

- [Nuxt 4](https://nuxt.com/) / Vue 3 / TypeScript
- [Prisma](https://www.prisma.io/) + PostgreSQL
- SCSS mit eigenem Design-Token-System
- [Zod](https://zod.dev/) für Validierung
- Docker & Docker Compose fürs Deployment
- [Bun](https://bun.sh/) als Paketmanager

## 🚀 Erste Schritte

**Voraussetzungen:** Docker & Docker Compose

```bash
# Repository klonen
git clone https://github.com/MindCollaps/KIK.git
cd KIK

# Umgebungsvariablen anlegen
cp .env.example .env
# .env danach mit echten Zugangsdaten befüllen

# Entwicklungsumgebung starten (App + Datenbank)
bun run dev
```

Die Seite ist danach unter `http://localhost:3000` erreichbar, der Admin-Bereich unter `/admin`.

Alternativ lässt sich das Nuxt-Frontend auch ohne Docker starten (`bun run dev:local`), dafür wird aber eine eigene laufende PostgreSQL-Instanz benötigt.

### 🗃️ Datenbank-Befehle

```bash
bun run db-push        # Schema ohne Migration übernehmen
bun run db-deploy       # ausstehende Migrationen einspielen
bun run db-reset        # Datenbank + Migrationen komplett zurücksetzen
```

### 🧹 Linting

```bash
bun run lint       # ESLint + Stylelint
bun run lint:fix    # …und gleich reparieren
```

## 🗂️ Projektstruktur

```
app/
├── components/    # Vue-Komponenten (Blocks, UI, Admin, Themes)
├── pages/         # Nuxt-Routen
├── composables/   # geteilte Logik
└── scss/          # Farb- und Design-Tokens
server/
├── routes/        # API-Endpunkte & Feeds (iCal, RSS, Sitemap)
├── utils/         # Auth, Validierung, Seed-Daten
└── plugins/       # Nitro-Plugins (u. a. Erst-Seeding der Inhalte)
prisma/
└── schema.prisma  # Datenmodell
```

## 🤝 Mitmachen

Das KiK-Team sucht immer Verstärkung — bei Filmvorführung, Programmplanung, Öffentlichkeitsarbeit oder Gastro. Mehr dazu auf [`/mitmachen`](https://www.kino-im-kasten.de/mitmachen) auf der Live-Seite.

## 📬 Kontakt

- ✉️ [info@kino-im-kasten.de](mailto:info@kino-im-kasten.de)
- 📸 [Instagram](https://www.instagram.com/kinoimkasten/)
- 🐘 [Mastodon](https://mastodon.social/@kinoimkasten)

---

<div align="center">© Objektiv e.V. · Kino im Kasten — Filmkultur seit 1993</div>
