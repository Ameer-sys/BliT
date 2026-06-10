import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

const statusLabels = {
  empty: "Empty",
  pending: "Pending",
  taken: "Taken",
  skipped: "Skipped",
  partial: "Partial",
};

export default function BlisterPack({ slots, onMarkTaken, onSkip, isSaving, readOnly = false }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const completed = useMemo(() => slots.filter((slot) => slot.status === "taken").length, [slots]);
  const percent = slots.length ? Math.round((completed / slots.length) * 100) : 0;

  async function markTaken() {
    if (!selectedSlot?.meds?.length) return;
    await onMarkTaken(selectedSlot);
    setSelectedSlot(null);
  }

  async function skipDose() {
    if (!selectedSlot?.meds?.length || !onSkip) return;
    await onSkip(selectedSlot);
    setSelectedSlot(null);
  }

  return (
    <section className="blister-section">
      <div className="summary-card">
        <p className="muted">Today's blister pack</p>
        <div className="summary-row">
          <strong>
            {completed} / {slots.length}
          </strong>
          <span>doses completed</span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="section-heading">
        <h2>Dose pockets</h2>
        <span>Tap a pocket to review</span>
      </div>

      <div className="blister-grid">
        {slots.map((slot) => (
          <button
            className={`blister-pocket ${slot.status || "pending"}`}
            key={slot.id}
            type="button"
            onClick={() => setSelectedSlot(slot)}
          >
            <span className="pocket-top">
              <span>{slot.label}</span>
              <span>{slot.time}</span>
            </span>
            <span className="pill-row">
              {slot.meds.length ? (
                slot.meds.map((med) => <span className="pill-shape" key={med.id} />)
              ) : (
                <span className="empty-pocket">No meds</span>
              )}
            </span>
            <span className="pocket-meds">
              {slot.meds.length
                ? slot.meds.map((med) => `${med.name} ${med.dosage || ""}`.trim()).join(", ")
                : "No medications scheduled"}
            </span>
            <span className="status-chip">
              {slot.status === "taken" && slot.takenAt
                ? `Taken ${slot.takenAt}`
                : statusLabels[slot.status] || "Pending"}
            </span>
          </button>
        ))}
      </div>

      {selectedSlot && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedSlot(null)}>
          <article
            className="dose-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dose-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="close-btn" type="button" onClick={() => setSelectedSlot(null)}>
              x
            </button>
            <p className="muted">
              {selectedSlot.label} dose - {selectedSlot.time}
            </p>
            <h2 id="dose-title">
              {selectedSlot.meds.length
                ? `${selectedSlot.meds.length} medication${selectedSlot.meds.length === 1 ? "" : "s"}`
                : "Empty pocket"}
            </h2>
            <p>{selectedSlot.instructions}</p>
            <div className="dose-detail-list">
              {selectedSlot.meds.length ? (
                selectedSlot.meds.map((med) => (
                  <article key={med.id}>
                    <strong>{med.name}</strong>
                    <span>{med.dosage || "Dose not specified"}</span>
                    {med.instructions && <p>{med.instructions}</p>}
                  </article>
                ))
              ) : (
                <article>
                  <strong>No meds scheduled</strong>
                  <span>This pocket is here for timing, but nothing is assigned today.</span>
                </article>
              )}
            </div>
            <div className="dose-modal-status">
              <Clock3 size={16} />
              <span>
                Status: {statusLabels[selectedSlot.status] || "Pending"}
                {selectedSlot.takenAt ? ` at ${selectedSlot.takenAt}` : ""}
              </span>
            </div>
            {selectedSlot.status === "taken" ? (
              <button className="primary-btn done" type="button" disabled>
                <CheckCircle2 size={18} />
                Already taken
              </button>
            ) : selectedSlot.status === "skipped" ? (
              <button className="primary-btn subtle" type="button" disabled>
                <XCircle size={18} />
                Skipped
              </button>
            ) : readOnly ? (
              <button className="primary-btn subtle" type="button" disabled>
                Patient marks this dose on their side
              </button>
            ) : (
              <div className="split-actions">
                <button
                  className="primary-btn"
                  type="button"
                  disabled={isSaving || selectedSlot.meds.length === 0}
                  onClick={markTaken}
                >
                  {isSaving ? "Saving..." : "Mark taken"}
                </button>
                <button
                  className="primary-btn subtle"
                  type="button"
                  disabled={isSaving || selectedSlot.meds.length === 0}
                  onClick={skipDose}
                >
                  Skip
                </button>
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
