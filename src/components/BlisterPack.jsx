import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function BlisterPack({ slots, onMarkTaken, isSaving, readOnly = false }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const completed = useMemo(() => slots.filter((slot) => slot.taken).length, [slots]);
  const percent = slots.length ? Math.round((completed / slots.length) * 100) : 0;

  async function markTaken() {
    if (!selectedSlot?.meds?.length) return;
    await onMarkTaken(selectedSlot);
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
            className={`blister-pocket ${slot.taken ? "taken" : ""}`}
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
            <span className="status-chip">
              {slot.meds.length === 0 ? "Empty" : slot.taken ? `Taken ${slot.takenAt}` : "Pending"}
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
            <h2 id="dose-title">{selectedSlot.meds[0]}</h2>
            <p>{selectedSlot.instructions}</p>
            <ul>
              {selectedSlot.meds.map((med) => (
                <li key={med.id}>
                  {med.name} {med.dosage}
                </li>
              ))}
            </ul>
            {selectedSlot.taken ? (
              <button className="primary-btn done" type="button" disabled>
                <CheckCircle2 size={18} />
                Already taken
              </button>
            ) : readOnly ? (
              <button className="primary-btn subtle" type="button" disabled>
                Patient marks this dose on their side
              </button>
            ) : (
              <button
                className="primary-btn"
                type="button"
                disabled={isSaving || selectedSlot.meds.length === 0}
                onClick={markTaken}
              >
                {isSaving ? "Saving..." : "Mark taken"}
              </button>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
