import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { todayKey } from "./date.js";

export const SLOT_DEFS = [
  { id: "breakfast", label: "Breakfast", time: "8:00 AM", frequencyType: "daily", daysOfWeek: [] },
  { id: "lunch", label: "Lunch", time: "12:30 PM", frequencyType: "daily", daysOfWeek: [] },
  { id: "dinner", label: "Dinner", time: "6:00 PM", frequencyType: "daily", daysOfWeek: [] },
  { id: "bedtime", label: "Bedtime", time: "9:30 PM", frequencyType: "daily", daysOfWeek: [] },
];

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function withId(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

function normalizeSlot(slot) {
  return String(slot || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function pocketIdFor(label) {
  return normalizeSlot(label) || `pocket-${Date.now()}`;
}

export function getPatientDosePockets(patient) {
  const custom = Array.isArray(patient?.dosePockets) ? patient.dosePockets : [];
  const merged = [...SLOT_DEFS, ...custom].reduce((acc, pocket) => {
    const id = normalizeSlot(pocket.id || pocket.label);
    if (!id || acc.some((item) => item.id === id)) return acc;
    acc.push({
      id,
      label: pocket.label || id,
      time: pocket.time || "",
      frequencyType: pocket.frequencyType || "daily",
      daysOfWeek: pocket.daysOfWeek || [],
      notes: pocket.notes || "",
      startDate: pocket.startDate || "",
    });
    return acc;
  }, []);
  return merged;
}

function isPocketDueToday(pocket, date = todayKey()) {
  const day = DAY_KEYS[new Date(`${date}T12:00:00`).getDay()];
  const type = pocket.frequencyType || "daily";

  if (type === "specific_days" || type === "weekly") {
    return (pocket.daysOfWeek || []).includes(day);
  }

  if (type === "every_other_day") {
    const start = pocket.startDate || date;
    const days = Math.floor(
      (new Date(`${date}T12:00:00`) - new Date(`${start}T12:00:00`)) / 86400000,
    );
    return days % 2 === 0;
  }

  return true;
}

function formatLogTime(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export async function getUserRole(uid) {
  const snapshot = await getDocs(query(collection(db, "users"), where("__name__", "==", uid), limit(1)));
  const [user] = withId(snapshot);
  return user?.role;
}

export async function getPatientForUser(uid) {
  const snapshot = await getDocs(
    query(collection(db, "patients"), where("linkedUserId", "==", uid), limit(1)),
  );
  return withId(snapshot)[0] || null;
}

export async function getPatientForProvider(uid) {
  const snapshot = await getDocs(
    query(collection(db, "patients"), where("createdByProviderId", "==", uid), limit(1)),
  );
  return withId(snapshot)[0] || null;
}

export async function getPatientsForProvider(uid) {
  const snapshot = await getDocs(
    query(collection(db, "patients"), where("createdByProviderId", "==", uid)),
  );
  return withId(snapshot).sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
}

export async function getPatientById(patientId) {
  const patientSnap = await getDoc(doc(db, "patients", patientId));
  return patientSnap.exists() ? { id: patientSnap.id, ...patientSnap.data() } : null;
}

export async function updatePatient(patientId, values) {
  return updateDoc(doc(db, "patients", patientId), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid, values) {
  return setDoc(
    doc(db, "users", uid),
    {
      ...values,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const snapshot = await getDocs(
    query(collection(db, "users"), where("email", "==", normalizedEmail), limit(1)),
  );
  return withId(snapshot)[0] || null;
}

export async function getOrCreatePatientForUser({ patientUser, providerId }) {
  const existingPatient = await getPatientForUser(patientUser.id);

  if (existingPatient) {
    await setDoc(
      doc(db, "patients", existingPatient.id),
      {
        createdByProviderId: providerId,
        linkedUserId: patientUser.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { ...existingPatient, createdByProviderId: providerId };
  }

  const patientRef = doc(collection(db, "patients"));
  const patient = {
    name: patientUser.name || patientUser.email,
    email: patientUser.email,
    linkedUserId: patientUser.id,
    createdByProviderId: providerId,
    patientCode: `BLT-${patientRef.id.slice(0, 6).toUpperCase()}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(patientRef, patient);
  return { id: patientRef.id, ...patient };
}

export async function getActiveMedications(patientId) {
  const snapshot = await getDocs(
    query(
      collection(db, "medications"),
      where("patientId", "==", patientId),
      where("status", "==", "active"),
    ),
  );
  return withId(snapshot);
}

export async function getRecords(patientId) {
  const snapshot = await getDocs(
    query(collection(db, "records"), where("patientId", "==", patientId)),
  );
  return withId(snapshot).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

export async function getDoseLogs(patientId, date = todayKey()) {
  const snapshot = await getDocs(
    query(
      collection(db, "doseLogs"),
      where("patientId", "==", patientId),
      where("date", "==", date),
    ),
  );
  return withId(snapshot);
}

export function buildDoseSlots(medications, doseLogs, dosePockets = SLOT_DEFS, date = todayKey()) {
  const pockets = (dosePockets.length ? dosePockets : SLOT_DEFS).filter((slot) =>
    isPocketDueToday(slot, date),
  );

  return pockets.map((slot) => {
    const slotId = normalizeSlot(slot.id || slot.label);
    const slotMeds = medications
      .filter((medication) =>
        (medication.scheduleSlots || []).map(normalizeSlot).includes(slotId),
      )
      .map((medication) => ({
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage,
        instructions: medication.instructions,
      }));

    const slotLogs = doseLogs.filter((log) => normalizeSlot(log.slot) === slotId);
    const takenLogs = slotLogs.filter((log) => log.status === "taken");
    const skippedLogs = slotLogs.filter((log) => log.status === "skipped");
    const takenMedicationIds = new Set(takenLogs.map((log) => log.medicationId));
    const skippedMedicationIds = new Set(skippedLogs.map((log) => log.medicationId));
    const takenCount = slotMeds.filter((medication) => takenMedicationIds.has(medication.id)).length;
    const skippedCount = slotMeds.filter((medication) => skippedMedicationIds.has(medication.id)).length;
    const status =
      slotMeds.length === 0
        ? "empty"
        : takenCount === slotMeds.length
          ? "taken"
          : skippedCount === slotMeds.length
            ? "skipped"
            : "pending";
    const latestTaken = takenLogs
      .map((log) => log.takenAt || log.updatedAt || log.createdAt)
      .filter(Boolean)
      .at(-1);

    return {
      ...slot,
      id: slotId,
      instructions: slotMeds[0]?.instructions || "No medications scheduled for this pocket.",
      meds: slotMeds,
      logs: slotLogs,
      status,
      taken: status === "taken",
      skipped: status === "skipped",
      takenAt: status === "taken" ? formatLogTime(latestTaken) || "today" : "",
    };
  });
}

export async function writeSlotDoseLog({ patientId, slot, medications, status, date = todayKey() }) {
  const slotId = normalizeSlot(slot);
  const writes = medications.map((medication) =>
    addDoc(collection(db, "doseLogs"), {
      patientId,
      medicationId: medication.id,
      date,
      slot: slotId,
      status,
      ...(status === "taken" ? { takenAt: serverTimestamp() } : { skippedAt: serverTimestamp() }),
      createdAt: serverTimestamp(),
    }),
  );

  await Promise.all(writes);
}

export function markSlotTaken(values) {
  return writeSlotDoseLog({ ...values, status: "taken" });
}

export function skipSlot(values) {
  return writeSlotDoseLog({ ...values, status: "skipped" });
}

export async function createMedication({ patientId, providerId, values }) {
  return addDoc(collection(db, "medications"), {
    patientId,
    prescribedBy: providerId,
    name: values.name,
    dosage: values.dosage,
    instructions: values.instructions,
    scheduleSlots: values.scheduleSlots,
    frequencyType: values.frequencyType || "daily",
    daysOfWeek: values.daysOfWeek || [],
    scheduleNotes: values.scheduleNotes || "",
    startDate: values.startDate || todayKey(),
    endDate: values.endDate || "",
    status: "active",
    createdAt: serverTimestamp(),
  });
}

export async function updateMedication(medicationId, values) {
  return updateDoc(doc(db, "medications", medicationId), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function createRecord({ patientId, providerId, values }) {
  return addDoc(collection(db, "records"), {
    patientId,
    providerId,
    type: values.type,
    title: values.title,
    date: values.date || todayKey(),
    notes: values.notes,
    detail: values.notes,
    fileUrl: values.fileUrl || "",
    fileName: values.fileName || "",
    fileType: values.fileType || "",
    uploadedAt: values.fileUrl ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
  });
}

export async function uploadRecordFile({ patientId, file }) {
  if (!file) return null;
  const safeName = file.name.replace(/[^\w.\-]+/g, "-");
  const fileRef = ref(storage, `records/${patientId}/${Date.now()}-${safeName}`);
  await uploadBytes(fileRef, file);
  return {
    fileUrl: await getDownloadURL(fileRef),
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
  };
}
