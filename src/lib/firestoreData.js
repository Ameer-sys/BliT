import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { todayKey } from "./date.js";

export const SLOT_DEFS = [
  { id: "breakfast", label: "Breakfast", time: "8:00 AM" },
  { id: "lunch", label: "Lunch", time: "12:30 PM" },
  { id: "dinner", label: "Dinner", time: "6:00 PM" },
  { id: "bedtime", label: "Bedtime", time: "9:30 PM" },
];

function withId(snapshot) {
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

function normalizeSlot(slot) {
  return String(slot || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
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

export function buildDoseSlots(medications, doseLogs) {
  return SLOT_DEFS.map((slot) => {
    const slotMeds = medications
      .filter((medication) =>
        (medication.scheduleSlots || []).map(normalizeSlot).includes(slot.id),
      )
      .map((medication) => ({
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage,
        instructions: medication.instructions,
      }));

    const takenCount = slotMeds.filter((medication) =>
      doseLogs.some(
        (log) =>
          log.medicationId === medication.id &&
          normalizeSlot(log.slot) === slot.id &&
          log.status === "taken",
      ),
    ).length;

    return {
      ...slot,
      instructions: slotMeds[0]?.instructions || "No medications scheduled for this pocket.",
      meds: slotMeds,
      taken: slotMeds.length > 0 && takenCount === slotMeds.length,
      takenAt: slotMeds.length > 0 && takenCount === slotMeds.length ? "today" : "",
    };
  });
}

export async function markSlotTaken({ patientId, slot, medications, date = todayKey() }) {
  const slotId = normalizeSlot(slot);
  const writes = medications.map((medication) =>
    addDoc(collection(db, "doseLogs"), {
      patientId,
      medicationId: medication.id,
      date,
      slot: slotId,
      status: "taken",
      takenAt: serverTimestamp(),
    }),
  );

  await Promise.all(writes);
}

export async function createMedication({ patientId, providerId, values }) {
  return addDoc(collection(db, "medications"), {
    patientId,
    prescribedBy: providerId,
    name: values.name,
    dosage: values.dosage,
    instructions: values.instructions,
    scheduleSlots: values.scheduleSlots,
    startDate: values.startDate || todayKey(),
    endDate: values.endDate || "",
    status: "active",
    createdAt: serverTimestamp(),
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
    createdAt: serverTimestamp(),
  });
}
