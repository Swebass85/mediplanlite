
CREATE TABLE IF NOT EXISTS nurses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  staff_id TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL
    CHECK (department IN ('Akuten', 'Kirurgi', 'Förlossning'))
);

INSERT OR IGNORE INTO nurses (name, staff_id, department)
VALUES
  ('Anna Andersson', '1001', 'Akuten'),
  ('Erik Svensson', '1002', 'Akuten'),
  ('Maria Nilsson', '1003', 'Kirurgi'),
  ('Johan Karlsson', '1004', 'Kirurgi'),
  ('Sara Lindberg', '1005', 'Förlossning'),
  ('Emma Johansson', '1006', 'Förlossning');

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  department TEXT NOT NULL,
  shift_date TEXT NOT NULL,
  shift TEXT NOT NULL
    CHECK (shift IN ('morgon', 'kvall', 'natt')),
  notes TEXT NOT NULL DEFAULT ''
);
