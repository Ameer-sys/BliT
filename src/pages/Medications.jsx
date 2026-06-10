import PageHeader from "../components/PageHeader.jsx";
import { medications } from "../data/mockData.js";

export default function Medications() {
  return (
    <>
      <PageHeader
        eyebrow="Medication plan"
        title="Active medications"
        text="Medication details remain available even when the dashboard focuses on dose timing."
      />
      <div className="med-list">
        {medications.map((med) => (
          <article className="med-card" key={med.name}>
            <div>
              <h2>{med.name}</h2>
              <p>
                {med.dosage} - {med.instructions}
              </p>
            </div>
            <span className="type-pill">{med.ends}</span>
            <div className="med-times">
              {med.timing.map((time) => (
                <span key={time}>{time}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
