import { useEffect, useState } from "react";
import { CalendarPlus, FilePlus2, Search, UserPlus } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createMedication,
  createRecord,
  getActiveMedications,
  getPatientForProvider,
  getRecords,
  SLOT_DEFS,
} from "../lib/firestoreData.js";

const actions = [
  { title: "Add medication", text: "Create dose pockets by meal and bedtime.", icon: CalendarPlus },
  { title: "Add health record", text: "Log visits, labs, diagnoses, or notes.", icon: FilePlus2 },
  { title: "Find patient", text: "Search by patient code, phone, or name.", icon: Search },
  { title: "Create access", text: "Generate patient login credentials.", icon: UserPlus },
];

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

export default function ProviderDashboard() {
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [records, setRecords] = useState([]);
  const [medicationForm, setMedicationForm] = useState(initialMedicationForm);
  const [recordForm, setRecordForm] = useState(initialRecordForm);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function loadProviderWorkspace() {
    if (!currentUser) return;
    setLoading(true);
    setStatus("");

    try {
      const patientDoc = await getPatientForProvider(currentUser.uid);
      setPatient(patientDoc);

      if (!patientDoc) {
        setMedications([]);
        setRecords([]);
        return;
      }

      const [medicationDocs, recordDocs] = await Promise.all([
        getActiveMedications(patientDoc.id),
        getRecords(patientDoc.id),
      ]);
      setMedications(medicationDocs);
      setRecords(recordDocs);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProviderWorkspace();
  }, [currentUser]);

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

  async function handleAddMedication(event) {
    event.preventDefault();
    if (!patient || medicationForm.scheduleSlots.length === 0) return;
    setIsSaving(true);
    setStatus("");

    try {
      await createMedication({
        patientId: patient.id,
        providerId: currentUser.uid,
        values: medicationForm,
      });
      setMedicationForm(initialMedicationForm);
      setMedications(await getActiveMedications(patient.id));
      setStatus("Medication added to the patient plan.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddRecord(event) {
    event.preventDefault();
    if (!patient) return;
    setIsSaving(true);
    setStatus("");

    try {
      await createRecord({
        patientId: patient.id,
        providerId: currentUser.uid,
        values: recordForm,
      });
      setRecordForm(initialRecordForm);
      setRecords(await getRecords(patient.id));
      setStatus("Record added to the patient timeline.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return <div className="state-card">Loading provider workspace...</div>;
  }

  if (!patient) {
    return (
      <div className="state-card">
        No patient profile is assigned to this provider yet. Add a patients document
        where createdByProviderId equals {currentUser.uid}.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Provider workspace"
        title="Patient care controls"
        text="For the MVP, one provider account manages one patient profile."
      />

      <section className="provider-overview">
        <div>
          <p className="muted">Active patient</p>
          <h2>{patient.name}</h2>
          <p>
            {patient.age ? `Age ${patient.age} - ` : ""}
            Patient ID {patient.patientCode || patient.id}
          </p>
        </div>
        <div className="provider-stats">
          <span>
            <strong>{medications.length}</strong>
            active meds
          </span>
          <span>
            <strong>{records.length}</strong>
            records
          </span>
          <span>
            <strong>{patient.phone || "No phone"}</strong>
            contact
          </span>
        </div>
      </section>

      {status && <p className="helper-text status-text">{status}</p>}

      <section className="action-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <article key={action.title}>
              <Icon size={24} />
              <h3>{action.title}</h3>
              <p>{action.text}</p>
            </article>
          );
        })}
      </section>

      <section className="form-card">
        <div>
          <p className="eyebrow">Add medication schedule</p>
          <h2>Build the next blister pack</h2>
          <p>Schedule slots become the patient dashboard dose pockets.</p>
        </div>
        <form onSubmit={handleAddMedication}>
          <label>
            Medication name
            <input
              value={medicationForm.name}
              onChange={(event) => updateMedicationField("name", event.target.value)}
              required
            />
          </label>
          <label>
            Dosage
            <input
              value={medicationForm.dosage}
              onChange={(event) => updateMedicationField("dosage", event.target.value)}
              required
            />
          </label>
          <label>
            Instructions
            <textarea
              value={medicationForm.instructions}
              onChange={(event) => updateMedicationField("instructions", event.target.value)}
              required
            />
          </label>
          <div className="checkbox-grid" aria-label="Medication schedule slots">
            {SLOT_DEFS.map((slot) => (
              <label className="check-option" key={slot.id}>
                <input
                  type="checkbox"
                  checked={medicationForm.scheduleSlots.includes(slot.id)}
                  onChange={() => toggleScheduleSlot(slot.id)}
                />
                {slot.label}
              </label>
            ))}
          </div>
          <div className="two-column">
            <label>
              Start date
              <input
                type="date"
                value={medicationForm.startDate}
                onChange={(event) => updateMedicationField("startDate", event.target.value)}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={medicationForm.endDate}
                onChange={(event) => updateMedicationField("endDate", event.target.value)}
              />
            </label>
          </div>
          <button type="submit" disabled={isSaving || medicationForm.scheduleSlots.length === 0}>
            {isSaving ? "Saving..." : "Save medication"}
          </button>
        </form>
      </section>

      <section className="form-card">
        <div>
          <p className="eyebrow">Add health record</p>
          <h2>Update the care timeline</h2>
          <p>Records are stored in the records collection for this patient.</p>
        </div>
        <form onSubmit={handleAddRecord}>
          <label>
            Record type
            <input
              value={recordForm.type}
              onChange={(event) =>
                setRecordForm((current) => ({ ...current, type: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Title
            <input
              value={recordForm.title}
              onChange={(event) =>
                setRecordForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={recordForm.date}
              onChange={(event) =>
                setRecordForm((current) => ({ ...current, date: event.target.value }))
              }
            />
          </label>
          <label>
            Notes
            <textarea
              value={recordForm.notes}
              onChange={(event) =>
                setRecordForm((current) => ({ ...current, notes: event.target.value }))
              }
              required
            />
          </label>
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save record"}
          </button>
        </form>
      </section>
    </>
  );
}
