import Database from "better-sqlite3";
import express from "express";
import { mkdirSync, readFileSync } from "node:fs";

const app = express();
const PORT = process.env.PORT || 3000;

mkdirSync("database", { recursive: true });

const db = new Database("database/mediplan.db");
db.exec(readFileSync("database/schema.sql", "utf8"));

app.use(express.json());
app.use(express.static("public"));

const shifts = [
  { id: "morgon", name: "Morgon (06:00–14:00)" },
  { id: "kvall", name: "Kväll (14:00–22:00)" },
  { id: "natt", name: "Natt (22:00–06:00)" },
];

// Kontrollera bokningsuppgifter för både POST och PUT
function validateBooking(data) {
  const { nurse_id, department, shift_date, shift, notes = "" } = data || {};

  const nurseId = Number(nurse_id);

  if (!Number.isSafeInteger(nurseId) || nurseId <= 0) {
    return { error: "Välj en giltig sjuksköterska" };
  }

  const nurse = db.prepare("SELECT * FROM nurses WHERE id = ?").get(nurseId);

  if (!nurse) {
    return { error: "Sjuksköterskan hittades inte" };
  }

  if (department !== nurse.department) {
    return {
      error: "Sjuksköterskan kan bara bokas på sin egen avdelning",
    };
  }

  const validDate =
    typeof shift_date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(shift_date) &&
    !Number.isNaN(Date.parse(`${shift_date}T12:00:00Z`)) &&
    new Date(`${shift_date}T12:00:00Z`).toISOString().slice(0, 10) ===
      shift_date;

  if (
    !validDate ||
    !shifts.some((item) => item.id === shift) ||
    typeof notes !== "string"
  ) {
    return { error: "Kontrollera bokningens uppgifter" };
  }

  return {
    booking: {
      name: nurse.name,
      staff_id: nurse.staff_id,
      department: nurse.department,
      shift_date,
      shift,
      notes: notes.trim(),
    },
  };
}

// READ – hämta sjuksköterskor
app.get("/api/nurses", (req, res) => {
  const nurses = db.prepare("SELECT * FROM nurses ORDER BY name").all();

  res.json(nurses);
});

// READ – hämta arbetspass
app.get("/api/shifts", (req, res) => {
  res.json(shifts);
});

// READ – hämta alla bokningar
app.get("/api/bookings", (req, res) => {
  const bookings = db
    .prepare("SELECT * FROM bookings ORDER BY shift_date, id")
    .all();

  res.json(bookings);
});

// READ – hämta en bokning
app.get("/api/bookings/:id", (req, res) => {
  const booking = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(req.params.id);

  if (!booking) {
    return res.status(404).json({
      error: "Bokningen hittades inte",
    });
  }

  res.json(booking);
});

// CREATE – skapa bokning
app.post("/api/bookings", (req, res) => {
  const result = validateBooking(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const booking = result.booking;

  const info = db
    .prepare(
      `
      INSERT INTO bookings
      (name, staff_id, department, shift_date, shift, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    )
    .run(
      booking.name,
      booking.staff_id,
      booking.department,
      booking.shift_date,
      booking.shift,
      booking.notes,
    );

  const created = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json(created);
});

// UPDATE – ändra befintlig bokning
app.put("/api/bookings/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(req.params.id);

  if (!existing) {
    return res.status(404).json({
      error: "Bokningen hittades inte",
    });
  }

  const result = validateBooking(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const booking = result.booking;

  db.prepare(
    `
    UPDATE bookings
    SET
      name = ?,
      staff_id = ?,
      department = ?,
      shift_date = ?,
      shift = ?,
      notes = ?
    WHERE id = ?
  `,
  ).run(
    booking.name,
    booking.staff_id,
    booking.department,
    booking.shift_date,
    booking.shift,
    booking.notes,
    req.params.id,
  );

  const updated = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(req.params.id);

  res.json(updated);
});

// DELETE – ta bort bokning
app.delete("/api/bookings/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM bookings WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Bokningen hittades inte",
    });
  }

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`MediPlan körs på http://localhost:${PORT}`);
});
