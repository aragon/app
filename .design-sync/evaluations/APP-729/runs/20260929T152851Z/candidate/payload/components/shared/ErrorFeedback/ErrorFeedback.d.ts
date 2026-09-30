import * as React from 'react';

/**
 * ErrorFeedback — from @aragon/app@1.39.1 (apps/app/src/shared/components/errorFeedback/errorFeedback.tsx).
 */
export interface ErrorFeedbackProps {
  /** Translation key for the error title. */
  titleKey?: string;
  /** Translation key for the error description. */
  descriptionKey?: string;
  /** Custom object illustration. */
  illustration?: unknown;
  /** Custom primary button. */
  primaryButton?: unknown;
  /** Hides the report issue button when set to true. */
  hideReportButton?: boolean;
}

export declare const ErrorFeedback: React.ComponentType<ErrorFeedbackProps>;
