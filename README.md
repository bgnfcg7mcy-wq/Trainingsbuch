# Trainingsbuch

Fußballtrainings mit Datum, Inhalt und Zahlungsstatus. Pro Training werden 25 € berechnet. Die Übersicht zeigt bezahlte Einnahmen und offene Beträge. Rote Hauptfarbe, responsive Darstellung.

## Betrieb

- Next.js auf Vercel
- Quellcode auf GitHub
- Supabase Auth und Postgres; jeder Nutzer sieht ausschließlich seine eigenen Trainings.

## Lokaler Start

1. `npm ci`
2. `.env.example` nach `.env.local` kopieren und die Supabase-Projekt-URL sowie den Publishable Key eintragen.
3. `npm run dev`

`npm run build` erstellt die Produktionsversion. Das zugehörige Supabase-Projekt ist mit seinem öffentlichen Publishable Key vorkonfiguriert. Optional lassen sich `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel überschreiben. Der öffentliche Key verleiht ohne Anmeldung keinen Zugriff auf Trainingsdaten.

## Datenbank

Die SQL-Definition in `supabase/schema.sql` wurde im zugehörigen Supabase-Projekt angewendet. RLS schützt Lesen, Anlegen, Bearbeiten und Löschen anhand des angemeldeten Kontos. Es werden keine Service-Role-Schlüssel im Browser verwendet.

## Anmeldung

Nach dem Vercel-Import in Supabase unter Authentication → URL Configuration die neue App-Adresse als Site URL und Redirect URL hinterlegen. Ein Konto kann in der App erstellt werden. Wenn Supabase die E-Mail-Bestätigung verlangt, muss der Link aus dem Postfach bestätigt werden. Anschließend mit E-Mail und Passwort anmelden.

Die zuvor auf ChatGPT Sites gespeicherten Einträge sind nicht in dieser Datenbank enthalten. Die ursprüngliche App bleibt verfügbar.
