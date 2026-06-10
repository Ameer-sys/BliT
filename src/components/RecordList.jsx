import { useState } from "react";

function isImage(record) {
  return String(record.fileType || "").startsWith("image/");
}

function isPdf(record) {
  return String(record.fileType || "").includes("pdf");
}

export default function RecordList({ items, onSelect }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="record-list">
      {items.map((item) => {
        const id = item.id || `${item.title}-${item.date}`;
        const expanded = expandedId === id;
        return (
        <article
          className={`record-card ${expanded ? "expanded" : ""}`}
          key={id}
          onClick={() => {
            setExpandedId(expanded ? null : id);
            onSelect?.(item);
          }}
        >
          <div>
            <span className="type-pill">{item.type}</span>
            <h3>{item.title}</h3>
            <p>{item.detail || item.notes}</p>
            {expanded && item.notes && item.detail !== item.notes && <p>{item.notes}</p>}
            {isImage(item) && item.fileUrl && (
              <img className="record-preview" src={item.fileUrl} alt={item.fileName || item.title} />
            )}
            {isPdf(item) && item.fileUrl && (
              <a className="record-file-link" href={item.fileUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                Open PDF: {item.fileName || "Record file"}
              </a>
            )}
          </div>
          <strong>{item.date}</strong>
        </article>
        );
      })}
    </div>
  );
}
