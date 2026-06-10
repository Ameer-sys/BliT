import { useEffect, useState } from "react";
import { Activity, ClipboardList, FlaskConical, NotebookText, Pill, ScanLine, Stethoscope } from "lucide-react";
import BackButton from "../components/BackButton.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RecordList from "../components/RecordList.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPatientForUser, getPatientsForProvider, getRecords } from "../lib/firestoreData.js";

const tabs = [
  { id: "all", label: "All", icon: Activity },
  { id: "visit", label: "Visits", icon: Stethoscope, match: ["visit", "appointment"] },
  { id: "lab", label: "Labs", icon: FlaskConical, match: ["lab", "lab_result"] },
  { id: "prescription", label: "Prescriptions", icon: Pill, match: ["prescription"] },
  { id: "scan", label: "Scans", icon: ScanLine, match: ["scan", "imaging"] },
  { id: "note", label: "Notes", icon: NotebookText, match: ["note"] },
];

const demoRecords = [
  { id: "demo-1", type: "visit", title: "Cardiology check-in", date: "2026-06-08", detail: "Blood pressure improved. Continue current morning medication plan." },
  { id: "demo-2", type: "lab", title: "Lipid panel reviewed", date: "2026-06-02", detail: "LDL trending down. Doctor added follow-up in eight weeks." },
  { id: "demo-3", type: "prescription", title: "Vitamin-C adherence reminder", date: "2026-05-28", detail: "Daily morning dose attached to Breakfast pocket at 8:00 AM." },
  { id: "demo-4", type: "scan", title: "Chest scan uploaded", date: "2026-05-18", detail: "No urgent findings. Provider note attached for review." },
  { id: "demo-5", type: "note", title: "Pharmacy refill note", date: "2026-05-12", detail: "Next refill window opens in 12 days." },
];

export default function Timeline() {
  const { currentUser, role } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function loadTimeline() {
      if (!currentUser) return;
      setLoading(true);

      try {
        const patient =
          role === "provider"
            ? (await getPatientsForProvider(currentUser.uid))[0]
            : await getPatientForUser(currentUser.uid);
        const records = patient ? await getRecords(patient.id) : [];
        setTimeline(
          records.length === 0 && currentUser.email?.toLowerCase() === "muhammad@blit.com"
            ? demoRecords
            : records,
        );
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, [currentUser, role]);

  if (loading) {
    return <div className="state-card">Loading timeline...</div>;
  }

  const currentTab = tabs.find((tab) => tab.id === activeTab);
  const filteredTimeline =
    !currentTab || currentTab.id === "all"
      ? timeline
      : timeline.filter((record) => currentTab.match.includes(String(record.type || "note").toLowerCase()));
  const adherence = timeline.length ? 86 : 72;

  return (
    <>
      <PageHeader
        eyebrow="Health timeline"
        title="One clear story of care"
        text="Visits, lab results, prescriptions, pharmacy updates, and provider notes in order."
        action={<BackButton fallback={role === "provider" ? "/provider" : "/patient"} />}
      />
      <section className="timeline-widgets">
        <article>
          <ClipboardList size={20} />
          <span>Records</span>
          <strong>{timeline.length}</strong>
        </article>
        <article>
          <Activity size={20} />
          <span>Adherence trend</span>
          <strong>{adherence}%</strong>
          <div className="spark-bars">
            {[62, 78, 70, 92, adherence].map((value, index) => (
              <i key={index} style={{ height: `${value}%` }} />
            ))}
          </div>
        </article>
        <article>
          <Pill size={20} />
          <span>Medication events</span>
          <strong>{timeline.filter((item) => item.type === "prescription").length}</strong>
        </article>
      </section>
      <section className="tab-bar" aria-label="Filter timeline">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              className={activeTab === tab.id ? "active" : ""}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </section>
      {filteredTimeline.length ? (
        <div className="timeline-list">
          <RecordList items={filteredTimeline} />
        </div>
      ) : (
        <div className="state-card">No timeline items in this category yet.</div>
      )}
    </>
  );
}
