export function BrandSymbol({ className = "", alt = "" }) {
  return <img className={`brand-symbol ${className}`.trim()} src="/blit-symbol.png" alt={alt} />;
}

export default function Logo({ compact = false, stacked = false, className = "" }) {
  return (
    <div className={`logo ${stacked ? "stacked" : ""} ${className}`.trim()} aria-label="BliT">
      <BrandSymbol alt="" />
      <span>
        <strong>BliT</strong>
        {!compact && <small>Your health. Connected.</small>}
      </span>
    </div>
  );
}
