import * as React from 'react';

/**
 * StatCard — from @aragon/app@1.39.1 (apps/app/src/shared/components/statCard/statCard.tsx).
 */
export interface StatCardProps {
  /** The value to display in the stat card. */
  value: string | number;
  /** The label for the stat card. */
  label: string;
  /** An optional suffix to display after the value. */
  suffix?: string;
}

export declare const StatCard: React.ComponentType<StatCardProps>;
