# Changelog

## 0.5.1-beta
- 🧩 Neues `CommonBrandMark`-Component eingeführt und das bisher inline eingebettete Brand-SVG zentralisiert.
- 🔁 Brand-Logo-Verwendungen in Layout, Footer und Error-View auf `CommonBrandMark` umgestellt, um Duplikate zu vermeiden und Konsistenz zu sichern.
- 🎛️ Film-Admin-Liste visuell an die Programm-Liste angeglichen: Button-Content-Layout der Eintragszeilen entspricht jetzt dem Programm-Panel.
- 🧭 Admin-Header-Branding korrigiert: Icon-Mark und "Kino im Kasten" werden innerhalb des `UiButton` zuverlässig inline dargestellt.
- ✅ `UiButton` erweitert: neue Varianten `pill`, `pill-muted`, `ghost`, `quiet`, `dashed`, `icon-ghost` sowie `active`-State für Toggle-/Tab-Buttons.
- 🔁 Store- und Admin-Navigation auf wiederverwendbare Button-Typen umgestellt, inklusive aktiver Zustände ohne seitenlokale Sonderklassen.
- 🧹 Mehrere pseudo-typische CSS-Klassen (`ghost-button`, `add-button`, `icon-button`, `row-button`) in Admin-Bereichen reduziert oder entfernt und durch zentrale UI-Typen ersetzt.
- 🧩 Formular-Nutzung weiter vereinheitlicht über `UiForm`, damit Submit-Verhalten und Struktur konsistent über Komponenten bleiben.
- 📐 Erste Pattern-Prüfung für weitere UI-Elemente durchgeführt: Input-/Field-Strukturen zeigen ähnliche Wiederholungen und sind als nächster Kandidat für zentrale Field-Komponenten vorbereitet.

## 0.5.0
- Beginn of Changelog
