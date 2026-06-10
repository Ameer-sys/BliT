import { ArrowRight, FileText, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import BlisterPack from "../components/BlisterPack.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { doseSlots, patient, timeline } from "../data/mockData.js";

export default function PatientDashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Patient dashboard"
        title={`Good morning, ${patient.name.split(" ")[0]}`}
        text="Your medication plan and latest care activity are ready for today."
      />

      <div className="dashboard-grid">
        <BlisterPack initialSlots={doseSlots} />
        <aside className="stack">
          <article className="next-card">
            <div>
              <p className="muted">Upcoming dose</p>
              <h2>Dinner at 6:00 PM</h2>
              <p>Metformin 500mg with food.</p>
            </div>
            <Pill size={28} />
          </article>

          <article className="next-card soft">
            <div>
              <p className="muted">Latest record</p>
              <h2>{timeline[0].title}</h2>
              <p>{timeline[0].detail}</p>
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
