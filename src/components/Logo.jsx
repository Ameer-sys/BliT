export default function Logo({ compact = false }) {
  return (
    <div className="logo" aria-label="BliT">
      <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
        <rect width="48" height="48" rx="14" />
        <path d="M15 13h10.5c5.4 0 8.4 2.4 8.4 6.5 0 2.3-1.1 4-3.1 5 2.9.9 4.5 2.9 4.5 5.8 0 4.5-3.3 7.7-9.3 7.7H15V13Zm7.1 9.4h2.9c1.4 0 2.2-.7 2.2-1.9s-.8-1.9-2.2-1.9h-2.9v3.8Zm0 10h3.4c1.8 0 2.8-.8 2.8-2.3 0-1.4-1-2.2-2.8-2.2h-3.4v4.5Z" />
        <path d="M36.3 12.2h4.2v23.6h-4.2z" />
      </svg>
      {!compact && (
        <span>
          <strong>BliT</strong>
          <small>Care packed clearly</small>
        </span>
      )}
    </div>
  );
}
