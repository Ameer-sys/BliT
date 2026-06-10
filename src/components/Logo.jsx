export default function Logo({ compact = false }) {
  return (
    <div className="logo" aria-label="BliT">
      <span className="logo-mark">B</span>
      {!compact && (
        <span>
          <strong>BliT</strong>
          <small>Your health. Connected.</small>
        </span>
      )}
    </div>
  );
}
