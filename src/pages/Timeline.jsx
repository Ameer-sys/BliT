import PageHeader from "../components/PageHeader.jsx";
import RecordList from "../components/RecordList.jsx";
import { timeline } from "../data/mockData.js";

export default function Timeline() {
  return (
    <>
      <PageHeader
        eyebrow="Health timeline"
        title="One clear story of care"
        text="Visits, lab results, prescriptions, pharmacy updates, and provider notes in order."
      />
      <RecordList items={timeline} />
    </>
  );
}
