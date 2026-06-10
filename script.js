const doseSlots = [
  {
    id: "breakfast",
    label: "Breakfast",
    time: "8:00 AM",
    meds: ["Metformin 500mg", "Vitamin D 1000 IU"],
    instructions: "Take with food.",
    taken: true,
    takenAt: "8:12 AM",
  },
  {
    id: "lunch",
    label: "Lunch",
    time: "12:30 PM",
    meds: ["Aspirin 81mg"],
    instructions: "Take after meal.",
    taken: true,
    takenAt: "12:43 PM",
  },
  {
    id: "dinner",
    label: "Dinner",
    time: "6:00 PM",
    meds: ["Metformin 500mg"],
    instructions: "Take with food.",
    taken: false,
    takenAt: "",
  },
  {
    id: "bedtime",
    label: "Bedtime",
    time: "9:30 PM",
    meds: ["Atorvastatin 20mg"],
    instructions: "Take before sleep.",
    taken: false,
    takenAt: "",
  },
];

const timeline = [
  {
    type: "Lab",
    title: "Blood test results",
    date: "June 8, 2026",
    detail: "Cholesterol slightly elevated. Provider recommended evening statin.",
  },
  {
    type: "Visit",
    title: "Annual checkup",
    date: "May 22, 2026",
    detail: "Blood pressure improving. Continue medication plan and daily walks.",
  },
  {
    type: "Rx",
    title: "Metformin renewed",
    date: "May 1, 2026",
    detail: "500mg prescribed for Breakfast and Dinner through August 1.",
  },
  {
    type: "Note",
    title: "Pharmacy blister pack prepared",
    date: "April 28, 2026",
    detail: "Monthly dose pack organized by Breakfast, Lunch, Dinner, and Bedtime.",
  },
];

const medications = [
  {
    name: "Metformin",
    dosage: "500mg",
    instructions: "Take with food.",
    timing: ["Breakfast", "Dinner"],
    ends: "Aug 1, 2026",
  },
  {
    name: "Vitamin D",
    dosage: "1000 IU",
    instructions: "Take after meal.",
    timing: ["Breakfast"],
    ends: "Jul 9, 2026",
  },
  {
    name: "Atorvastatin",
    dosage: "20mg",
    instructions: "Take before sleep.",
    timing: ["Bedtime"],
    ends: "Ongoing",
  },
];

const blisterGrid = document.querySelector("#blisterGrid");
const timelineList = document.querySelector("#timelineList");
const medList = document.querySelector("#medList");
const doseSummary = document.querySelector("#doseSummary");
const doseProgress = document.querySelector("#doseProgress");
const heroProgressBar = document.querySelector("#heroProgressBar");
const heroProgressText = document.querySelector("#heroProgressText");
const providerAdherence = document.querySelector("#providerAdherence");
const patientScreen = document.querySelector("#patientScreen");
const providerScreen = document.querySelector("#providerScreen");
const bottomNav = document.querySelector(".bottom-nav");
const doseDialog = document.querySelector("#doseDialog");
const dialogSlot = document.querySelector("#dialogSlot");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogInstructions = document.querySelector("#dialogInstructions");
const dialogMeds = document.querySelector("#dialogMeds");
const markTakenBtn = document.querySelector("#markTakenBtn");
let selectedSlotId = "";

function renderBlisterPack() {
  blisterGrid.innerHTML = doseSlots
    .map((slot) => {
      const pills = slot.meds.map(() => '<span class="pill-shape"></span>').join("");
      const status = slot.taken ? `Taken ${slot.takenAt}` : "Pending";
      return `
        <button class="blister-pocket ${slot.taken ? "taken" : ""}" type="button" data-slot="${slot.id}">
          <span class="pocket-top">
            <span>${slot.label}</span>
            <span>${slot.time}</span>
          </span>
          <span class="pill-row">${pills}</span>
          <span class="status-chip">${status}</span>
        </button>
      `;
    })
    .join("");
}

function renderTimeline() {
  timelineList.innerHTML = timeline
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="item-head">
            <div>
              <strong>${item.title}</strong>
              <p>${item.date}</p>
            </div>
            <span class="type-pill">${item.type}</span>
          </div>
          <p>${item.detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderMedications() {
  medList.innerHTML = medications
    .map(
      (med) => `
        <article class="med-card">
          <div class="med-head">
            <div>
              <strong>${med.name}</strong>
              <p>${med.dosage} - ${med.instructions}</p>
            </div>
            <span class="type-pill">${med.ends}</span>
          </div>
          <div class="med-times">
            ${med.timing.map((time) => `<span>${time}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function updateProgress() {
  const total = doseSlots.length;
  const taken = doseSlots.filter((slot) => slot.taken).length;
  const percent = Math.round((taken / total) * 100);

  doseSummary.textContent = `${taken} / ${total}`;
  doseProgress.style.width = `${percent}%`;
  heroProgressBar.style.width = `${percent}%`;
  heroProgressText.textContent = `${taken} / ${total} doses`;
  providerAdherence.textContent = `${percent}%`;
}

function openDoseDialog(slotId) {
  const slot = doseSlots.find((item) => item.id === slotId);
  if (!slot) return;

  selectedSlotId = slotId;
  dialogSlot.textContent = `${slot.label} dose - ${slot.time}`;
  dialogTitle.textContent = slot.meds[0];
  dialogInstructions.textContent = slot.instructions;
  dialogMeds.innerHTML = slot.meds.map((med) => `<li>${med}</li>`).join("");
  markTakenBtn.textContent = slot.taken ? "Already taken" : "Mark taken";
  markTakenBtn.disabled = slot.taken;
  doseDialog.showModal();
}

function showPatientView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === viewName);
  });
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === viewName);
  });
}

function showRole(role) {
  const isPatient = role === "patient";
  patientScreen.classList.toggle("active", isPatient);
  providerScreen.classList.toggle("active", !isPatient);
  bottomNav.style.display = isPatient ? "grid" : "none";
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
}

function updateProviderDetail(action) {
  const content = {
    medication: {
      title: "Add a medication schedule",
      body: "Create clear dose pockets for Breakfast, Lunch, Dinner, and Bedtime so Sarah sees exactly what to take.",
      fields: ["Metformin", "500mg", "Breakfast + Dinner"],
      button: "Save schedule",
    },
    record: {
      title: "Add a health record",
      body: "Log a visit, lab result, prescription, diagnosis, note, or uploaded file into the patient timeline.",
      fields: ["Blood test results", "Lab result", "Cholesterol slightly elevated"],
      button: "Save record",
    },
    timeline: {
      title: "Review patient timeline",
      body: "See Sarah's recent care events in order before adding or updating the treatment plan.",
      fields: ["June 8, 2026", "Blood test", "View all records"],
      button: "Open timeline",
    },
    patient: {
      title: "Create patient access",
      body: "Generate a patient code and temporary password after verifying contact details.",
      fields: ["Sarah Johnson", "sarah@example.com", "PRY-2048"],
      button: "Send access",
    },
  }[action];

  document.querySelector("#providerDetail").innerHTML = `
    <p class="muted">Provider action</p>
    <h3>${content.title}</h3>
    <p>${content.body}</p>
    <form class="mini-form">
      ${content.fields
        .map(
          (field, index) => `
            <label>
              ${["Primary field", "Detail", "Notes"][index]}
              <input value="${field}" />
            </label>
          `,
        )
        .join("")}
      <button type="button">${content.button}</button>
    </form>
  `;
}

document.addEventListener("click", (event) => {
  const slotButton = event.target.closest("[data-slot]");
  const navButton = event.target.closest("[data-nav]");
  const roleButton = event.target.closest("[data-role]");
  const actionButton = event.target.closest("[data-action]");
  const jumpButton = event.target.closest("[data-jump]");

  if (slotButton) openDoseDialog(slotButton.dataset.slot);
  if (navButton) showPatientView(navButton.dataset.nav);
  if (roleButton) showRole(roleButton.dataset.role);
  if (jumpButton) showPatientView(jumpButton.dataset.jump);
  if (actionButton) {
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.classList.toggle("active", button === actionButton);
    });
    updateProviderDetail(actionButton.dataset.action);
  }
  if (event.target.matches(".close-btn")) doseDialog.close();
});

markTakenBtn.addEventListener("click", () => {
  const slot = doseSlots.find((item) => item.id === selectedSlotId);
  if (!slot || slot.taken) return;

  slot.taken = true;
  slot.takenAt = "Just now";
  renderBlisterPack();
  updateProgress();
  doseDialog.close();
});

renderBlisterPack();
renderTimeline();
renderMedications();
updateProgress();
