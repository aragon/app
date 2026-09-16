/**
 * Earliest of the defined dates; null when none is present.
 */
export function earliest(dates: Array<Date | null | undefined>): Date | null {
  const defined = dates.filter((date): date is Date => date != null);
  if (defined.length === 0) {
    return null;
  }
  return new Date(Math.min(...defined.map((date) => date.getTime())));
}

/**
 * Latest of the defined dates; null when none is present.
 */
export function latest(dates: Array<Date | null | undefined>): Date | null {
  const defined = dates.filter((date): date is Date => date != null);
  if (defined.length === 0) {
    return null;
  }
  return new Date(Math.max(...defined.map((date) => date.getTime())));
}
