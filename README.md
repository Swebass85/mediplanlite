# MediPlan Lite – Bokningsadministration

MediPlan Lite är en kursapplikation för att administrera sjuksköterskors arbetspass. Projektet är byggt med HTML, CSS, vanilla JavaScript, Node.js, Express och SQLite.

Applikationen demonstrerar CRUD-operationer via ett REST API och använder `fetch()` för att kommunicera mellan frontend och backend utan att ladda om sidan.

## Installation

1. Klona projektet från GitHub eller ladda ner projektfilerna.
2. Öppna projektmappen i VS Code.
3. Installera beroenden:

   `npm install`

4. Starta servern:

   `npm start`

5. Öppna http://localhost:3000 i webbläsaren.

Databasen `database/mediplan.db` skapas automatiskt när servern startar.

Databastabellerna skapas med hjälp av `database/schema.sql`, som även innehåller sex sjuksköterskor med tillhörande avdelningar.

## Funktioner

- Välj sjuksköterska från en dropdown som hämtar information från databasen.
- Visa personal-ID och avdelning automatiskt utifrån vald sjuksköterska.
- Begränsa bokningar till sjuksköterskans egen avdelning.
- Välj datum och arbetspass (morgon, kväll eller natt).
- Skapa nya bokningar.
- Visa befintliga bokningar i en tabell.
- Redigera bokningar, exempelvis datum och arbetspass.
- Ta bort bokningar.
- Sök efter sjuksköterskor i bokningstabellen medan man skriver.
- Klicka på en bokning för att visa detaljer i en dialogruta.
- Visa felmeddelanden vid misslyckade API-anrop.

## CRUD

| Operation | HTTP-metod | Funktion          |
| --------- | ---------- | ----------------- |
| Create    | POST       | Skapa bokning     |
| Read      | GET        | Hämta bokningar   |
| Update    | PUT        | Uppdatera bokning |
| Delete    | DELETE     | Ta bort bokning   |

## REST API

### Sjuksköterskor och arbetspass

- `GET /api/nurses` – Hämta sjuksköterskor.
- `GET /api/shifts` – Hämta tillgängliga arbetspass.

### Bokningar

- `GET /api/bookings` – Hämta alla bokningar.
- `GET /api/bookings/:id` – Hämta en specifik bokning.
- `POST /api/bookings` – Skapa bokning.
- `PUT /api/bookings/:id` – Uppdatera bokning.
- `DELETE /api/bookings/:id` – Ta bort bokning.

### HTTP-statuskoder

- `200 OK` – Begäran lyckades.
- `201 Created` – En bokning skapades.
- `204 No Content` – En bokning togs bort.
- `400 Bad Request` – Ogiltiga uppgifter.
- `404 Not Found` – Bokningen eller sjuksköterskan hittades inte.

## Databas

Projektet använder SQLite med två tabeller:

**nurses**

Innehåller sjuksköterskornas namn, personal-ID och avdelning.

**bookings**

Innehåller bokningar
