import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarPlus, FilePlus2, Pill, Save } from "lucide-react";
import BackButton from "../components/BackButton.jsx";
import BlisterPack from "../components/BlisterPack.jsx";
import RecordList from "../components/RecordList.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  buildDoseSlots,
  createMedication,
  createRecord,
  getActiveMedications,
  getDoseLogs,
  getPatientById,
  getRecords,
  SLOT_DEFS,
  updateMedication,
  updatePatient,
} from "../lib/firestoreData.js";
import { useParams } from "react-router-dom";

const initialMedicationForm = {
  name: "",
  dosage: "",
  instructions: "",
  scheduleSlots: ["breakfast"],
  startDate: "",
  endDate: "",
};

const initialRecordForm = {
  type: "note",
  title: "",
  date: "",
  notes: "",
};

export default function PatientDetail() {
  const { patientId } = useParams();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({ name: "", email: "", phone: "", dob: "" });
  const [medications, setMedications] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [records, setRecords] = useState([]);
  const [medicationForm, setMedicationForm] = useState(initialMedicationForm);
  const [recordForm, setRecordForm] = useState(initialRecordForm);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const slots = useMemo(() => buildDoseSlots(medications, doseLogs), [medications, doseLogs]);

  async function loadPatient() {
    setLoading(true);
    setStatus("");
    try {
      const [patientDoc, medicationDocs, doseLogDocs, recordDocs] = await Promise.all([
        getPatientById(patientId),
        getActiveMedications(patientId),
        getDoseLogs(patientId),
        getRecords(patientId),
      ]);
      setPatient(patientDoc);
      setPatientForm({
        name: patientDoc?.name || "",
        email: patientDoc?.email || "",
        phone: patientDoc?.phone || "",
        dob: patientDoc?.dob || "",
      });
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
    loadPatient();
  }, [patientId]);

  function updateMedicationField(field, value) {
    setMedicationForm((current) => ({ ...current, [field]: value }));
  }

  function toggleScheduleSlot(slotId) {
    setMedicationForm((current) => {
      const hasSlot = current.scheduleSlots.includes(slotId);
      return {
        ...current,
        scheduleSlots: hasSlot
          ? current.scheduleSlots.filter((slot) => slot !== slotId)
          : [...current.scheduleSlots, slotId],
      };
    });
  }

  async function handleSavePatient(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updatePatient(patientId, patientForm);
      setStatus("Patient info updated.");
      await loadPatient();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddMedication(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await createMedication({
        patientId,
        providerId: currentUser.uid,
        values: medicationForm,
      });
      setMedicationForm(initialMedicationForm);
      setMedications(await getActiveMedications(patientId));
      setStatus("Medication added.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePauseMedication(medicationId) {
    setIsSaving(true);
    try {
      await updateMedication(medicationId, { status: "paused" });
      setMedications(await getActiveMedications(patientId));
      setStatus("Medication paused.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddRecord(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await createRecord({
        patientId,
        providerId: currentUser.uid,
        values: recordForm,
      });
      setRecordForm(initialRecordForm);
      setRecords(await getRecords(patientId));
      setStatus("Record added.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) return <div className="state-card">Loading patient...</div>;
  if (!patient) return <div className="state-card">Patient not found.</div>;

  return (
    <div className="patient-detail page-enter">
      <BackButton fallback="/provider" label="Dashboard" />

      <section className="patient-detail-hero">
        <div>
          <p className="eyebrow">Patient workspace</p>
          <h1>{patient.name || patient.email}</h1>
          <p>{patient.patientCode || patient.id}</p>
        </div>
        <div className="patient-detail-stats">
          <span><Pill size={18} /> {medications.length} meds</span>
          <span><FilePlus2 size={18} /> {records.length} records</span>
          <span><Activity size={18} /> {doseLogs.length} logs today</span>
        </div>
      </section>

      {status && <p className="helper-text status-text">{status}</p>}

      <section className="detail-grid">
        <form className="panel-form" onSubmit={handleSavePatient}>
          <div>
            <p className="eyebrow">Patient info</p>
            <h2>Editable profile</h2>
          </div>
          <label>
            Full name
            <input value={patientForm.name} onChange={(event) => setPatientForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            Email
            <input value={patientForm.email} onChange={(event) => setPatientForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <div className="two-column">
            <label>
              Phone
              <input value={patientForm.phone} onChange={(event) => setPatientForm((current) => ({ ...current, phone: event.target.value }))} />
            </label>
            <label>
              Date of birth
              <input type="date" value={patientForm.dob} onChange={(event) => setPatientForm((current) => ({ ...current, dob: event.target.value }))} />
            </label>
          </div>
          <button type="submit" disabled={isSaving}>
            <Save size={18} />
            Save patient info
          </button>
        </form>

        <BlisterPack slots={slots} isSaving={isSaving} readOnly onMarkTaken={() => {}} />
      </section>

      <section className="detail-grid">
        <form className="panel-form" onSubmit={handleAddMedication}>
          <div>
            <p className="eyebrow">Medication</p>
            <h2>Add schedule</h2>
          </div>
          <label>
            Medication name
            <input value={medicationForm.name} onChange={(event) => updateMedicationField("name", event.target.value)} required />
          </label>
          <label>
            Dosage
            <input value={medicationForm.dosage} onChange={(event) => updateMedicationField("dosage", event.target.value)} required />
          </label>
          <label>
            Instructions
            <textarea value={medicationForm.instructions} onChange={(event) => updateMedicationField("instructions", event.target.value)} required />
          </label>
          <div className="checkbox-grid">
            {SLOT_DEFS.map((slot) => (
              <label className="check-option" key={slot.id}>
                <input type="checkbox" checked={medicationForm.scheduleSlots.includes(slot.id)} onChange={() => toggleScheduleSlot(slot.id)} />
                {slot.label}
              </label>
            ))}
          </div>
          <button type="submit" disabled={isSaving || medicationForm.scheduleSlots.length === 0}>
            <CalendarPlus size={18} />
            Add medication
          </button>
        </form>

        <section className="panel-card">
          <p className="eyebrow">Active medication</p>
          <h2>Current plan</h2>
          <div className="mini-list">
            {medications.length === 0 ? (
              <p className="muted">No active medication yet.</p>
            ) : (
              medications.map((medication) => (
                <article key={medication.id}>
                  <div>
                    <strong>{medication.name}</strong>
                    <p>{medication.dosage} - {(medication.scheduleSlots || []).join(", ")}</p>
                  </div>
                  <button type="button" disabled={isSaving} onClick={() => handlePauseMedication(medication.id)}>
                    Pause
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="detail-grid">
        <form className="panel-form" onSubmit={handleAddRecord}>
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Add record</h2>
          </div>
          <div className="two-column">
            <label>
              Type
              <input value={recordForm.type} onChange={(event) => setRecordForm((current) => ({ ...current, type: event.target.value }))} required />
            </label>
            <label>
              Date
              <input type="date" value={recordForm.date} onChange={(event) => setRecordForm((current) => ({ ...current, date: event.target.value }))} />
            </label>
          </div>
          <label>
            Title
            <input value={recordForm.title} onChange={(event) => setRecordForm((current) => ({ ...current, title: event.target.value }))} required />
          </label>
          <label>
            Notes
            <textarea value={recordForm.notes} onChange={(event) => setRecordForm((current) => ({ ...current, notes: event.target.value }))} required />
          </label>
          <button type="submit" disabled={isSaving}>
            <FilePlus2 size={18} />
            Add record
          </button>
        </form>

        <section className="panel-card">
          <p className="eyebrow">History</p>
          <h2>Recent records</h2>
          {records.length ? <RecordList items={records} /> : <p className="muted">No records yet.</p>}
        </section>
      </section>
    </div>
  );
}
