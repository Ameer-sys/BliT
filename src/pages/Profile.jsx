import PageHeader from "../components/PageHeader.jsx";
import { patient } from "../data/mockData.js";

const details = [
  ["Patient ID", patient.id],
  ["Date of birth", patient.dob],
  ["Phone", patient.phone],
  ["Emergency contact", patient.emergencyContact],
  ["Linked provider", patient.provider],
  ["Pharmacy", patient.pharmacy],
];

export default function Profile() {
  return (
    <>
      <PageHeader
        eyebrow="Patient profile"
        title={patient.name}
        text="Identity, care team, emergency contact, and linked provider access."
      />
      <section className="profile-layout">
        <div className="profile-hero">
          <div className="avatar">SJ</div>
          <h2>{patient.name}</h2>
          <p>
            Age {patient.age} - {patient.id}
          </p>
        </div>
        <div className="details-list">
          {details.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
