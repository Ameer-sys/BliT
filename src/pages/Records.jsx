import PageHeader from "../components/PageHeader.jsx";

const records = [
  { label: "Appointments", value: "3", detail: "Checkups and provider notes" },
  { label: "Lab results", value: "2", detail: "Bloodwork and summaries" },
  { label: "Prescriptions", value: "4", detail: "Current and historical scripts" },
  { label: "Uploads", value: "1", detail: "Files from clinic or pharmacy" },
];

export default function Records() {
  return (
    <>
      <PageHeader
        eyebrow="Records library"
        title="Everything organized by type"
        text="The timeline tells the story; records keep the source documents easy to find."
      />
      <section className="records-grid">
        {records.map((record) => (
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
