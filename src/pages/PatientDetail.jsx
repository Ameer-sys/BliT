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
  getPatientDosePockets,
  getRecords,
  uploadRecordFile,
  pocketIdFor,
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
  frequencyType: "daily",
  daysOfWeek: [],
  scheduleNotes: "",
  startDate: "",
  endDate: "",
};

const initialRecordForm = {
  type: "note",
  title: "",
  date: "",
  notes: "",
};

const initialPocketForm = {
  label: "",
  time: "",
  frequencyType: "daily",
  daysOfWeek: [],
  notes: "",
};

const dayOptions = [
  ["sun", "Sun"],
  ["mon", "Mon"],
  ["tue", "Tue"],
  ["wed", "Wed"],
  ["thu", "Thu"],
  ["fri", "Fri"],
  ["sat", "Sat"],
];

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
  const [recordFile, setRecordFile] = useState(null);
  const [pocketForm, setPocketForm] = useState(initialPocketForm);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const slots = useMemo(
    () => buildDoseSlots(medications, doseLogs, getPatientDosePockets(patient)),
    [medications, doseLogs, patient],
  );

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

  function toggleMedicationDay(day) {
    setMedicationForm((current) => ({
      ...current,
      daysOfWeek: current.daysOfWeek.includes(day)
        ? current.daysOfWeek.filter((item) => item !== day)
        : [...current.daysOfWeek, day],
    }));
  }

  function togglePocketDay(day) {
    setPocketForm((current) => ({
      ...current,
      daysOfWeek: current.daysOfWeek.includes(day)
        ? current.daysOfWeek.filter((item) => item !== day)
        : [...current.daysOfWeek, day],
    }));
  }

  async function handleAddPocket(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const id = pocketIdFor(pocketForm.label);
      const existing = Array.isArray(patient.dosePockets) ? patient.dosePockets : [];
      await updatePatient(patientId, {
        dosePockets: [
          ...existing.filter((pocket) => pocket.id !== id),
          { ...pocketForm, id },
        ],
      });
      setPocketForm(initialPocketForm);
      setStatus("Dose pocket saved.");
      await loadPatient();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePocket(pocketId) {
    setIsSaving(true);
    try {
      const existing = Array.isArray(patient.dosePockets) ? patient.dosePockets : [];
      await updatePatient(patientId, {
        dosePockets: existing.filter((pocket) => pocket.id !== pocketId),
      });
      setStatus("Dose pocket removed.");
      await loadPatient();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
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
      const uploadedFile = recordFile
        ? await uploadRecordFile({ patientId, file: recordFile })
        : null;
      await createRecord({
        patientId,
        providerId: currentUser.uid,
        values: { ...recordForm, ...(uploadedFile || {}) },
      });
      setRecordForm(initialRecordForm);
      setRecordFile(null);
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
          <div className="two-column">
            <label>
              Frequency
              <select value={medicationForm.frequencyType} onChange={(event) => updateMedicationField("frequencyType", event.target.value)}>
                <option value="daily">Daily</option>
                <option value="specific_days">Specific days</option>
                <option value="every_other_day">Every other day</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label>
              Optional notes
              <input value={medicationForm.scheduleNotes} onChange={(event) => updateMedicationField("scheduleNotes", event.target.value)} placeholder="After food, every other day..." />
            </label>
          </div>
          {["specific_days", "weekly"].includes(medicationForm.frequencyType) && (
            <div className="checkbox-grid compact-days">
              {dayOptions.map(([day, label]) => (
                <label className="check-option" key={day}>
                  <input type="checkbox" checked={medicationForm.daysOfWeek.includes(day)} onChange={() => toggleMedicationDay(day)} />
                  {label}
                </label>
              ))}
            </div>
          )}
          <div className="checkbox-grid">
            {getPatientDosePockets(patient).map((slot) => (
              <label className="check-option" key={slot.id}>
                <input type="checkbox" checked={medicationForm.scheduleSlots.includes(slot.id)} onChange={() => toggleScheduleSlot(slot.id)} />
                {slot.label} {slot.time ? `(${slot.time})` : ""}
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
        <form className="panel-form" onSubmit={handleAddPocket}>
          <div>
            <p className="eyebrow">Dose pockets</p>
            <h2>Customize schedule</h2>
          </div>
          <div className="two-column">
            <label>
              Slot label
              <input value={pocketForm.label} onChange={(event) => setPocketForm((current) => ({ ...current, label: event.target.value }))} placeholder="Morning, 8:00 AM, Weekly dose..." required />
            </label>
            <label>
              Scheduled time
              <input type="time" value={pocketForm.time} onChange={(event) => setPocketForm((current) => ({ ...current, time: event.target.value }))} />
            </label>
          </div>
          <label>
            Frequency type
            <select value={pocketForm.frequencyType} onChange={(event) => setPocketForm((current) => ({ ...current, frequencyType: event.target.value }))}>
              <option value="daily">Daily</option>
              <option value="specific_days">Specific days</option>
              <option value="every_other_day">Every other day</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          {["specific_days", "weekly"].includes(pocketForm.frequencyType) && (
            <div className="checkbox-grid compact-days">
              {dayOptions.map(([day, label]) => (
                <label className="check-option" key={day}>
                  <input type="checkbox" checked={pocketForm.daysOfWeek.includes(day)} onChange={() => togglePocketDay(day)} />
                  {label}
                </label>
              ))}
            </div>
          )}
          <label>
            Notes
            <input value={pocketForm.notes} onChange={(event) => setPocketForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Once weekly, Monday/Wednesday/Friday..." />
          </label>
          <button type="submit" disabled={isSaving}>Save dose pocket</button>
        </form>
        <section className="panel-card">
          <p className="eyebrow">Patient schedule</p>
          <h2>Dose pockets</h2>
          <div className="mini-list">
            {getPatientDosePockets(patient).map((pocket) => {
              const isDefault = SLOT_DEFS.some((slot) => slot.id === pocket.id);
              return (
                <article key={pocket.id}>
                  <div>
                    <strong>{pocket.label} {pocket.time ? `at ${pocket.time}` : ""}</strong>
                    <p>{pocket.frequencyType || "daily"} {pocket.daysOfWeek?.length ? `- ${pocket.daysOfWeek.join(", ")}` : ""}</p>
                  </div>
                  {!isDefault && (
                    <div className="mini-actions">
                      <button type="button" onClick={() => setPocketForm(pocket)}>
                        Edit
                      </button>
                      <button type="button" disabled={isSaving} onClick={() => handleDeletePocket(pocket.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
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
          <label>
            Upload photo or PDF
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setRecordFile(event.target.files?.[0] || null)}
            />
          </label>
          {recordFile && <p className="helper-text">Ready to upload: {recordFile.name}</p>}
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
