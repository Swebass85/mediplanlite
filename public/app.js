const form = document.querySelector("#bookingForm");
const table = document.querySelector("#bookingsTable");
const search = document.querySelector("#search");
const message = document.querySelector("#message");
const dialog = document.querySelector("#detailsDialog");
const details = document.querySelector("#details");

const nurseSelect = document.querySelector("#nurse");
const staffIdInput = document.querySelector("#staffId");
const departmentSelect = document.querySelector("#department");
const shiftSelect = document.querySelector("#shift");

const submitButton = document.querySelector("#submitButton");
const cancelEditButton = document.querySelector("#cancelEdit");

let nurses = [];
let bookings = [];
let shifts = [];

let editingId = null;

// -----------------------------------
// HTTP-anrop till backend
// -----------------------------------

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(data.error || `HTTP-fel: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// -----------------------------------
// Visa meddelanden
// -----------------------------------

function showMessage(text) {
  message.textContent = text;
}

// -----------------------------------
// Hämta vald sjuksköterska
// -----------------------------------

function getSelectedNurse() {
  return nurses.find((nurse) => nurse.id === Number(nurseSelect.value));
}

// -----------------------------------
// Uppdatera personal-ID och avdelning
// -----------------------------------

function updateNurseFields() {
  const nurse = getSelectedNurse();

  staffIdInput.value = nurse?.staff_id || "";
  departmentSelect.value = nurse?.department || "";
}

// -----------------------------------
// Återställ formuläret
// -----------------------------------

function resetForm() {
  form.reset();

  editingId = null;

  staffIdInput.value = "";
  departmentSelect.value = "";

  submitButton.textContent = "Boka sjuksköterska";
  cancelEditButton.hidden = true;
}

// -----------------------------------
// Visa bokningar i tabellen
// -----------------------------------

function renderBookings() {
  table.replaceChildren();

  const term = search.value.trim().toLowerCase();

  const filteredBookings = bookings.filter((booking) =>
    booking.name.toLowerCase().includes(term),
  );

  for (const booking of filteredBookings) {
    const row = document.createElement("tr");
    row.dataset.id = booking.id;

    const shiftName =
      shifts.find((shift) => shift.id === booking.shift)?.name || booking.shift;

    const values = [
      booking.name,
      booking.staff_id,
      booking.department,
      booking.shift_date,
      shiftName,
    ];

    for (const value of values) {
      const cell = document.createElement("td");

      cell.textContent = value;

      row.append(cell);
    }

    const actionsCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.textContent = "Redigera";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Ta bort";

    actionsCell.append(editButton, deleteButton);
    row.append(actionsCell);

    table.append(row);
  }
}

// -----------------------------------
// Hämta data från backend
// -----------------------------------

async function loadData() {
  try {
    [nurses, shifts, bookings] = await Promise.all([
      request("/api/nurses"),
      request("/api/shifts"),
      request("/api/bookings"),
    ]);

    // Sjuksköterskor
    nurseSelect.length = 1;

    for (const nurse of nurses) {
      const option = document.createElement("option");

      option.value = String(nurse.id);
      option.textContent = nurse.name;

      nurseSelect.append(option);
    }

    // Arbetspass
    shiftSelect.length = 1;

    for (const shift of shifts) {
      const option = document.createElement("option");

      option.value = shift.id;
      option.textContent = shift.name;

      shiftSelect.append(option);
    }

    renderBookings();
  } catch (error) {
    showMessage(error.message);
  }
}

// -----------------------------------
// Välj sjuksköterska
// -----------------------------------

nurseSelect.addEventListener("change", () => {
  updateNurseFields();
});

// Avdelningen måste matcha sjuksköterskan
departmentSelect.addEventListener("change", () => {
  updateNurseFields();
});

// -----------------------------------
// Avbryt redigering
// -----------------------------------

cancelEditButton.addEventListener("click", () => {
  resetForm();

  showMessage("Redigeringen avbröts.");
});

// -----------------------------------
// CREATE och UPDATE
// -----------------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const nurse = getSelectedNurse();

  if (!nurse) {
    showMessage("Välj en sjuksköterska.");
    return;
  }

  // Läs de aktuella värdena från formuläret
  const booking = {
    nurse_id: String(nurse.id),
    department: nurse.department,
    shift_date: form.elements.shift_date.value,
    shift: shiftSelect.value,
    notes: form.elements.notes.value,
  };

  const isEditing = editingId !== null;

  const url = isEditing ? `/api/bookings/${editingId}` : "/api/bookings";

  const method = isEditing ? "PUT" : "POST";

  console.log("HTTP-metod:", method);
  console.log("Bokning som skickas:", booking);

  try {
    const saved = await request(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booking),
    });

    if (isEditing) {
      // UPDATE: ersätt bokningen i arrayen
      bookings = bookings.map((item) => (item.id === saved.id ? saved : item));
    } else {
      // CREATE: lägg till den nya bokningen
      bookings.push(saved);
    }

    bookings.sort(
      (a, b) => a.shift_date.localeCompare(b.shift_date) || a.id - b.id,
    );

    renderBookings();

    resetForm();

    showMessage(
      isEditing ? "Bokningen har uppdaterats." : "Bokningen har skapats.",
    );
  } catch (error) {
    showMessage(error.message);
  }
});

// -----------------------------------
// Sök bland bokningar
// -----------------------------------

search.addEventListener("input", () => {
  renderBookings();
});

// -----------------------------------
// Hantera klick i tabellen
// -----------------------------------

table.addEventListener("click", async (event) => {
  const row = event.target.closest("tr[data-id]");

  if (!row) {
    return;
  }

  const id = Number(row.dataset.id);

  const booking = bookings.find((item) => item.id === id);

  if (!booking) {
    return;
  }

  const action = event.target.closest("button")?.dataset.action;

  // -----------------------------------
  // DELETE
  // -----------------------------------

  if (action === "delete") {
    try {
      await request(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      bookings = bookings.filter((item) => item.id !== id);

      if (editingId === id) {
        resetForm();
      }

      renderBookings();

      showMessage("Bokningen har tagits bort.");
    } catch (error) {
      showMessage(error.message);
    }

    return;
  }

  // -----------------------------------
  // UPDATE: starta redigering
  // -----------------------------------

  if (action === "edit") {
    const nurse = nurses.find((item) => item.staff_id === booking.staff_id);

    if (!nurse) {
      showMessage("Sjuksköterskan finns inte längre i registret.");
      return;
    }

    editingId = id;

    // Fyll formuläret med befintlig bokning
    nurseSelect.value = String(nurse.id);

    updateNurseFields();

    form.elements.shift_date.value = booking.shift_date;

    // Välj befintligt arbetspass
    shiftSelect.value = booking.shift;

    form.elements.notes.value = booking.notes || "";

    submitButton.textContent = "Spara ändringar";
    cancelEditButton.hidden = false;

    showMessage(`Redigerar bokning för ${booking.name}.`);

    form.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    return;
  }

  // -----------------------------------
  // READ: visa bokningsdetaljer
  // -----------------------------------

  details.replaceChildren();

  const shiftName =
    shifts.find((shift) => shift.id === booking.shift)?.name || booking.shift;

  const fields = [
    ["Namn", booking.name],
    ["Personal-ID", booking.staff_id],
    ["Avdelning", booking.department],
    ["Datum", booking.shift_date],
    ["Arbetspass", shiftName],
    ["Anteckning", booking.notes || "–"],
  ];

  for (const [label, value] of fields) {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;

    paragraph.append(strong, document.createTextNode(value));

    details.append(paragraph);
  }

  dialog.showModal();
});

// -----------------------------------
// Starta MediPlan
// -----------------------------------

loadData();
