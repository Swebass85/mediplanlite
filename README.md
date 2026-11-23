# MediPlan – Bokningsadministration

Minimal kursapplikation byggd med HTML, CSS, vanlig JavaScript, Express och SQLite.

## Installation

1. Öppna projektmappen i VS Code.
2. Kör `npm install` i terminalen (i samma mapp som `package.json`).
3. Kör `npm start`.
4. Öppna http://localhost:3000.

Databasen `database/mediplan.db` skapas automatiskt när servern startar. Tabellerna skapas med `database/schema.sql`.

## Funktioner

- Boka sjuksköterska med namn, personal-ID, avdelning, datum, arbetspass och anteckning.
- Hämta och visa bokningar utan omladdning.
- Radera bokningar (204 No Content) och hantera fel.
- Hämta arbetspass till dropdown.
- Filtrera på namn medan man skriver.
- Klicka på en bokning för att visa detaljer i dialog.

## API

- GET `/api/shifts`
- GET `/api/bookings`
- GET `/api/bookings/:id`
- POST `/api/bookings` (201 Created; 400 för felaktig data)
- DELETE `/api/bookings/:id` (204 No Content; 404 om den saknas)

## Inlämning

Kör `npm install` för att skapa `package-lock.json` och behåll den i ZIP-filen. Initiera Git (`git init`) och gör egna commits under utvecklingen. Ta bort `node_modules` innan inlämning. Stäm av egen applikation med läraren före inlämning.

Det här projektet innehåller inte autentisering, redigering eller localStorage. HTTP 401 och 403 kan därför diskuteras teoretiskt men demonstreras inte i appen.
