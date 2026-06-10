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

function defaultPocketDocId(patientId, slotId) {
  return `default_${patientId}_${slotId}`;
}

function legacyPocketDocId(patientId, labelOrId) {
  return `legacy_${patientId}_${normalizeSlot(labelOrId)}`;
}

function normalizePocket(pocket) {
  const legacySlotId = normalizeSlot(pocket.legacySlotId || pocket.label || pocket.id);
  return {
    ...pocket,
    label: pocket.label || legacySlotId,
    time: pocket.time || "",
    frequencyType: pocket.frequencyType || "daily",
    daysOfWeek: pocket.daysOfWeek || [],
    notes: pocket.notes || "",
    active: pocket.active !== false,
    legacySlotIds: Array.from(
      new Set([
        ...(pocket.legacySlotIds || []),
        pocket.legacySlotId,
        legacySlotId,
        normalizeSlot(pocket.label),
      ].filter(Boolean).map(normalizeSlot)),
    ),
  };
}

export async function getDosePockets(patientId, patient = null) {
  const snapshot = await getDocs(query(collection(db, "dosePockets"), where("patientId", "==", patientId)));
  const existingPockets = withId(snapshot).filter((pocket) => pocket.active !== false);
  const existingLegacyIds = new Set(
    existingPockets.flatMap((pocket) => [
      normalizeSlot(pocket.legacySlotId),
      normalizeSlot(pocket.label),
      ...(pocket.legacySlotIds || []).map(normalizeSlot),
    ]),
  );

  const providerId = patient?.createdByProviderId || patient?.providerId || "";
  const missingDefaultWrites = SLOT_DEFS.filter((slot) => !existingLegacyIds.has(slot.id)).map((slot) => {
    const pocketRef = doc(db, "dosePockets", defaultPocketDocId(patientId, slot.id));
    return setDoc(
      pocketRef,
      {
        patientId,
        providerId,
        label: slot.label,
        time: slot.time,
        frequencyType: slot.frequencyType,
        daysOfWeek: slot.daysOfWeek,
        active: true,
        legacySlotId: slot.id,
        legacySlotIds: [slot.id],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  const legacyPatientPockets = Array.isArray(patient?.dosePockets) ? patient.dosePockets : [];
  const missingLegacyWrites = legacyPatientPockets
    .filter((pocket) => !existingLegacyIds.has(normalizeSlot(pocket.id || pocket.label)))
    .map((pocket) => {
      const legacyId = normalizeSlot(pocket.id || pocket.label);
      return setDoc(
        doc(db, "dosePockets", legacyPocketDocId(patientId, legacyId)),
        {
          patientId,
          providerId,
          label: pocket.label || legacyId,
          time: pocket.time || "",
          frequencyType: pocket.frequencyType || "daily",
          daysOfWeek: pocket.daysOfWeek || [],
          notes: pocket.notes || "",
          active: pocket.active !== false,
          legacySlotId: legacyId,
          legacySlotIds: [legacyId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });

  if (missingDefaultWrites.length || missingLegacyWrites.length) {
    await Promise.all([...missingDefaultWrites, ...missingLegacyWrites]);
    const refreshed = await getDocs(query(collection(db, "dosePockets"), where("patientId", "==", patientId)));
    return withId(refreshed)
      .filter((pocket) => pocket.active !== false)
      .map(normalizePocket)
      .sort(comparePocketsByTime);
  }

  return existingPockets.map(normalizePocket).sort(comparePocketsByTime);
}

export function getPatientDosePockets(patient) {
  return [
    ...SLOT_DEFS.map((slot) =>
      normalizePocket({
        id: slot.id,
        ...slot,
        legacySlotId: slot.id,
        legacySlotIds: [slot.id],
      }),
    ),
    ...(Array.isArray(patient?.dosePockets) ? patient.dosePockets : []).map(normalizePocket),
  ];
}

export async function createDosePocket({ patientId, providerId, values }) {
  return addDoc(collection(db, "dosePockets"), {
    patientId,
    providerId,
    label: values.label,
    time: values.time || "",
    frequencyType: values.frequencyType || "daily",
    daysOfWeek: values.daysOfWeek || [],
    notes: values.notes || "",
    active: true,
    legacySlotId: normalizeSlot(values.label),
    legacySlotIds: [normalizeSlot(values.label)],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDosePocket(pocketId, values) {
  return updateDoc(doc(db, "dosePockets", pocketId), {
    label: values.label,
    time: values.time || "",
    frequencyType: values.frequencyType || "daily",
    daysOfWeek: values.daysOfWeek || [],
    notes: values.notes || "",
    active: values.active !== false,
    legacySlotIds: Array.from(
      new Set([...(values.legacySlotIds || []), normalizeSlot(values.label)].filter(Boolean)),
    ),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDosePocket(pocketId) {
  return updateDoc(doc(db, "dosePockets", pocketId), {
    active: false,
    updatedAt: serverTimestamp(),
  });
}

function comparePocketsByTime(a, b) {
  return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time) || String(a.label || "").localeCompare(String(b.label || ""));
}

export function parseTimeToMinutes(value) {
  const text = String(value || "").trim();
  if (!text) return 24 * 60 + 1;
  const twentyFourHour = text.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    return Number(twentyFourHour[1]) * 60 + Number(twentyFourHour[2]);
  }
  const twelveHour = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    const hour = Number(twelveHour[1]) % 12;
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3].toUpperCase();
    return (period === "PM" ? hour + 12 : hour) * 60 + minute;
  }
  return 24 * 60;
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
    query(collection(db, "medications"), where("patientId", "==", patientId)),
  );
  return withId(snapshot).filter((medication) => medication.active !== false && medication.status !== "paused");
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
    const slotId = slot.id;
    const matchIds = new Set([slot.id, ...(slot.legacySlotIds || [])].filter(Boolean).map(normalizeSlot));
    const slotMeds = medications
      .filter((medication) => {
        const assignedPocketIds = (medication.assignedPocketIds || []).map(normalizeSlot);
        const legacyScheduleSlots = (medication.scheduleSlots || []).map(normalizeSlot);
        const assignmentIds = [...assignedPocketIds, ...legacyScheduleSlots];
        const directMatch = assignmentIds.some((id) => matchIds.has(id));
        const legacyNameMatch =
          assignmentIds.length === 0 && normalizeSlot(medication.name) === normalizeSlot(slot.label);
        return directMatch || legacyNameMatch;
      })
      .map((medication) => ({
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage,
        instructions: medication.instructions,
      }));

    const slotLogs = doseLogs.filter(
      (log) => log.pocketId === slot.id || matchIds.has(normalizeSlot(log.slot)),
    );
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
            : takenCount > 0 || skippedCount > 0
              ? "partial"
              : "pending";
    const latestTaken = takenLogs
      .map((log) => log.takenAt || log.updatedAt || log.createdAt)
      .filter(Boolean)
      .at(-1);

    return {
      ...slot,
      id: slotId,
      pocketId: slotId,
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
  const pocketId = slot;
  const existingLogs = await getDoseLogs(patientId, date);
  const writes = medications.map((medication) => {
    const existingLog = existingLogs.find(
      (log) =>
        log.medicationId === medication.id &&
        (log.pocketId === pocketId || normalizeSlot(log.slot) === normalizeSlot(pocketId)),
    );
    const values = {
      patientId,
      medicationId: medication.id,
      pocketId,
      date,
      slot: pocketId,
      status,
      ...(status === "taken" ? { takenAt: serverTimestamp() } : { skippedAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    };

    if (existingLog) {
      return updateDoc(doc(db, "doseLogs", existingLog.id), values);
    }

    return addDoc(collection(db, "doseLogs"), {
      ...values,
      createdAt: serverTimestamp(),
    });
  });

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
    providerId,
    prescribedBy: providerId,
    name: values.name,
    dosage: values.dosage,
    instructions: values.instructions,
    active: true,
    assignedPocketIds: values.assignedPocketIds || values.scheduleSlots || [],
    scheduleSlots: values.assignedPocketIds || values.scheduleSlots || [],
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
