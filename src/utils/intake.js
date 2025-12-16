// Utilities for parsing and formatting intake strings
export function extractYearFromIntake(intake) {
  if (!intake) return null;
  // look for full 4-digit year like 2026
  const y4 = intake.match(/\b(20\d{2})\b/);
  if (y4) return y4[1];
  // look for common 2-digit years and map to 19xx/20xx
  const y2 = intake.match(/(?:'|’)?\b(\d{2})\b/);
  if (y2) {
    const yy = parseInt(y2[1], 10);
    if (!Number.isNaN(yy)) {
      return (yy < 50 ? 2000 + yy : 1900 + yy).toString();
    }
  }
  return null;
}

export function formatIntakeFromDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}
