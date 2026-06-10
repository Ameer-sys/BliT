import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPatientForUser, getPatientsForProvider, getRecords } from "../lib/firestoreData.js";

export default function Records() {
  const { currentUser, role } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const summaries = useMemo(() => {
    const counts = records.reduce((acc, record) => {
      const key = record.type || "note";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: "Appointments", value: counts.appointment || counts.visit || 0, detail: "Checkups and provider notes" },
      { label: "Lab results", value: counts.lab || counts.lab_result || 0, detail: "Bloodwork and summaries" },
      { label: "Prescriptions", value: counts.prescription || 0, detail: "Current and historical scripts" },
      { label: "Notes", value: counts.note || 0, detail: "Provider notes and care updates" },
    ];
  }, [records]);

  useEffect(() => {
    async function loadRecords() {
      if (!currentUser) return;
      setLoading(true);

      try {
        const patient =
          role === "provider"
            ? (await getPatientsForProvider(currentUser.uid))[0]
            : await getPatientForUser(currentUser.uid);
        setRecords(patient ? await getRecords(patient.id) : []);
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [currentUser, role]);

  if (loading) {
    return <div className="state-card">Loading records...</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Records library"
        title="Everything organized by type"
        text="The timeline tells the story; records keep the source documents easy to find."
      />
      <section className="records-grid">
        {summaries.map((record) => (
          <article key={record.label}>
            <strong>{record.value}</strong>
            <h2>{record.label}</h2>
            <p>{record.detail}</p>
          </article>
        ))}
      </section>
    </>
  );
}
