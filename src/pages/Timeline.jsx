import { useEffect, useState } from "react";
import BackButton from "../components/BackButton.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RecordList from "../components/RecordList.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPatientForUser, getPatientsForProvider, getRecords } from "../lib/firestoreData.js";

export default function Timeline() {
  const { currentUser, role } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      if (!currentUser) return;
      setLoading(true);

      try {
        const patient =
          role === "provider"
            ? (await getPatientsForProvider(currentUser.uid))[0]
            : await getPatientForUser(currentUser.uid);
        setTimeline(patient ? await getRecords(patient.id) : []);
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, [currentUser, role]);

  if (loading) {
    return <div className="state-card">Loading timeline...</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Health timeline"
        title="One clear story of care"
        text="Visits, lab results, prescriptions, pharmacy updates, and provider notes in order."
        action={<BackButton fallback={role === "provider" ? "/provider" : "/patient"} />}
      />
      {timeline.length ? <RecordList items={timeline} /> : <div className="state-card">No records yet.</div>}
    </>
  );
}
