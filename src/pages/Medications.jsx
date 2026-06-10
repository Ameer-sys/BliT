import { useEffect, useState } from "react";
import BackButton from "../components/BackButton.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getActiveMedications,
  getPatientForUser,
  getPatientsForProvider,
} from "../lib/firestoreData.js";

export default function Medications() {
  const { currentUser, role } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedications() {
      if (!currentUser) return;
      setLoading(true);

      try {
        const patient =
          role === "provider"
            ? (await getPatientsForProvider(currentUser.uid))[0]
            : await getPatientForUser(currentUser.uid);
        setMedications(patient ? await getActiveMedications(patient.id) : []);
      } finally {
        setLoading(false);
      }
    }

    loadMedications();
  }, [currentUser, role]);

  if (loading) {
    return <div className="state-card">Loading medications...</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Medication plan"
        title="Active medications"
        text="Medication details remain available even when the dashboard focuses on dose timing."
        action={<BackButton fallback={role === "provider" ? "/provider" : "/patient"} />}
      />
      <div className="med-list">
        {medications.length === 0 && (
          <div className="state-card">No active medications yet.</div>
        )}
        {medications.map((med) => (
          <article className="med-card" key={med.id}>
            <div>
              <h2>{med.name}</h2>
              <p>
                {med.dosage} - {med.instructions}
              </p>
            </div>
            <span className="type-pill">{med.endDate || "Active"}</span>
            <div className="med-times">
              {(med.scheduleSlots || []).map((time) => (
                <span key={time}>{time}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
