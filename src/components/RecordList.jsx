export default function RecordList({ items }) {
  return (
    <div className="record-list">
      {items.map((item) => (
        <article className="record-card" key={`${item.title}-${item.date}`}>
          <div>
            <span className="type-pill">{item.type}</span>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </div>
          <strong>{item.date}</strong>
        </article>
      ))}
    </div>
  );
}
