import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FileText, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import BlisterPack from "../components/BlisterPack.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  buildDoseSlots,
  getActiveMedications,
  getDosePockets,
  getDoseLogs,
  getPatientForUser,
  getRecords,
  markSlotTaken,
  parseTimeToMinutes,
  skipSlot,
} from "../lib/firestoreData.js";

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [dosePockets, setDosePockets] = useState([]);
  const [medications, setMedications] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const slots = useMemo(
    () => buildDoseSlots(medications, doseLogs, dosePockets),
    [medications, doseLogs, dosePockets],
  );
  const nextSlot = [...slots]
    .filter((slot) => slot.meds.length > 0 && ["pending", "partial"].includes(slot.status))
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))[0];
  const latestRecord = records[0];

  async function loadPatientWorkspace() {
    if (!currentUser) return;
    setLoading(true);
    setStatus("");

    try {
      const patientDoc = await getPatientForUser(currentUser.uid);
      setPatient(patientDoc);

      if (!patientDoc) {
        setDosePockets([]);
        setMedications([]);
        setDoseLogs([]);
        setRecords([]);
        return;
      }

      const [pocketDocs, medicationDocs, doseLogDocs, recordDocs] = await Promise.all([
        getDosePockets(patientDoc.id, patientDoc),
        getActiveMedications(patientDoc.id),
        getDoseLogs(patientDoc.id),
        getRecords(patientDoc.id),
      ]);
      setDosePockets(pocketDocs);
      setMedications(medicationDocs);
      setDoseLogs(doseLogDocs);
      setRecords(recordDocs);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatientWorkspace();
  }, [currentUser]);

  useEffect(() => {
    if (!patient || !import.meta.env.DEV) return;
    console.table(
      slots.map((slot) => ({
        patientId: patient.id,
        pocketId: slot.id,
        label: slot.label,
        matchedMedicationCount: slot.meds.length,
        status: slot.status,
      })),
    );
    console.info("[BliT dose debug]", {
      patientId: patient.id,
      loadedPocketsCount: dosePockets.length,
      loadedMedicationsCount: medications.length,
      medications: medications.map((medication) => ({
        id: medication.id,
        name: medication.name,
        assignedPocketIds: medication.assignedPocketIds || [],
        legacyScheduleSlots: medication.scheduleSlots || [],
      })),
    });
  }, [patient, dosePockets, medications, slots]);

  async function handleMarkTaken(slot) {
    if (!patient) return;
    setIsSaving(true);
    setStatus("");

    try {
      await markSlotTaken({
        patientId: patient.id,
        slot: slot.id,
        medications: slot.meds,
      });
      const refreshedLogs = await getDoseLogs(patient.id);
      setDoseLogs(refreshedLogs);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSkip(slot) {
    if (!patient) return;
    setIsSaving(true);
    setStatus("");

    try {
      await skipSlot({
        patientId: patient.id,
        slot: slot.id,
        medications: slot.meds,
      });
      setDoseLogs(await getDoseLogs(patient.id));
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return <div className="state-card">Loading your patient dashboard...</div>;
  }

  if (!patient) {
    return (
      <div className="state-card">
        No patient profile is linked to this account yet. If you signed up as a
        patient, refresh once. If a doctor created your account, ask them to add
        your email to their patient list.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Patient dashboard"
        title={`Good morning, ${patient.name.split(" ")[0]}`}
        text="Your medication plan and latest care activity are ready for today."
      />
      {status && <p className="helper-text error-text">{status}</p>}

      <div className="dashboard-grid">
        <BlisterPack slots={slots} onMarkTaken={handleMarkTaken} onSkip={handleSkip} isSaving={isSaving} />
        <aside className="stack">
          <article className="next-card">
            <div>
              <p className="muted">Upcoming dose</p>
              <h2>{nextSlot ? `${nextSlot.label} at ${nextSlot.time}` : "All done today"}</h2>
              <p>
                {nextSlot
                  ? nextSlot.meds.map((med) => `${med.name} ${med.dosage}`).join(", ")
                  : "No remaining active dose pockets."}
              </p>
            </div>
            <Pill size={28} />
          </article>

          <article className="next-card soft">
            <div>
              <p className="muted">Latest record</p>
              <h2>{latestRecord?.title || "No records yet"}</h2>
              <p>{latestRecord?.detail || latestRecord?.notes || "Provider records will appear here."}</p>
            </div>
            <FileText size={28} />
          </article>

          <Link className="wide-link" to="/timeline">
            View full timeline <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </>
  );
}
