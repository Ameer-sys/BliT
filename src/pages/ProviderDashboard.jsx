import { CalendarPlus, FilePlus2, Search, UserPlus } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { patient } from "../data/mockData.js";

const actions = [
  { title: "Add medication", text: "Create dose pockets by meal and bedtime.", icon: CalendarPlus },
  { title: "Add health record", text: "Log visits, labs, diagnoses, or notes.", icon: FilePlus2 },
  { title: "Find patient", text: "Search by patient code, phone, or name.", icon: Search },
  { title: "Create access", text: "Generate patient login credentials.", icon: UserPlus },
];

export default function ProviderDashboard() {
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
            Age {patient.age} - Patient ID {patient.id}
          </p>
        </div>
        <div className="provider-stats">
          <span>
            <strong>4</strong>
            today doses
          </span>
          <span>
            <strong>8</strong>
            records
          </span>
          <span>
            <strong>50%</strong>
            adherence
          </span>
        </div>
      </section>

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
        </div>
        <form>
          <label>
            Medication name
            <input defaultValue="Metformin" />
          </label>
          <label>
            Dosage
            <input defaultValue="500mg" />
          </label>
          <label>
            Schedule
            <input defaultValue="Breakfast + Dinner" />
          </label>
          <label>
            Instructions
            <textarea defaultValue="Take with food." />
          </label>
          <button type="button">Save medication</button>
        </form>
      </section>
    </>
  );
}
