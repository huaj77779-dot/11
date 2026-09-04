export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <span className={`verosuits-logo${compact ? " compact" : ""}`} aria-label="VEROSUITS"><img src="/brand/verosuits-logo-transparent-v3.png" alt="VEROSUITS" /></span>;
}
