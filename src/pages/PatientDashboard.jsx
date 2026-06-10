import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FileText, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import BlisterPack from "../components/BlisterPack.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  buildDoseSlots,
  getActiveMedications,
  getDoseLogs,
  getPatientForUser,
  getRecords,
  markSlotTaken,
} from "../lib/firestoreData.js";

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const slots = useMemo(() => buildDoseSlots(medications, doseLogs), [medications, doseLogs]);
  const nextSlot = slots.find((slot) => slot.meds.length > 0 && !slot.taken);
  const latestRecord = records[0];

  async function loadPatientWorkspace() {
    if (!currentUser) return;
    setLoading(true);
    setStatus("");

    try {
      const patientDoc = await getPatientForUser(currentUser.uid);
      setPatient(patientDoc);

      if (!patientDoc) {
        setMedications([]);
        setDoseLogs([]);
        setRecords([]);
        return;
      }

      const [medicationDocs, doseLogDocs, recordDocs] = await Promise.all([
        getActiveMedications(patientDoc.id),
        getDoseLogs(patientDoc.id),
        getRecords(patientDoc.id),
      ]);
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
        <BlisterPack slots={slots} onMarkTaken={handleMarkTaken} isSaving={isSaving} />
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
