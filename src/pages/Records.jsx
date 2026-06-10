import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import BackButton from "../components/BackButton.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RecordList from "../components/RecordList.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPatientForUser, getPatientsForProvider, getRecords } from "../lib/firestoreData.js";

const recordTabs = [
  { id: "all", label: "All" },
  { id: "visit", label: "Visits", match: ["visit", "appointment"] },
  { id: "lab", label: "Labs", match: ["lab", "lab_result"] },
  { id: "prescription", label: "Prescriptions", match: ["prescription"] },
  { id: "scan", label: "Scans", match: ["scan", "imaging"] },
  { id: "note", label: "Notes", match: ["note"] },
];

export default function Records() {
  const { currentUser, role } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
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
  const filteredRecords = useMemo(() => {
    const tab = recordTabs.find((item) => item.id === activeTab);
    if (!tab || tab.id === "all") return records;
    return records.filter((record) => tab.match.includes(String(record.type || "note").toLowerCase()));
  }, [activeTab, records]);

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
        action={<BackButton fallback={role === "provider" ? "/provider" : "/patient"} />}
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
      <section className="tab-bar" aria-label="Filter records">
        {recordTabs.map((tab) => (
          <button
            className={activeTab === tab.id ? "active" : ""}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </section>
      {filteredRecords.length ? (
        <RecordList items={filteredRecords} />
      ) : (
        <div className="state-card loading-brand">
          <FileText size={28} />
          <span>No records in this category yet.</span>
        </div>
      )}
    </>
  );
}
