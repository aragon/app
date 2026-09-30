import * as React from 'react';

/**
 * WizardDetailsDialog — from @aragon/app@1.39.1 (apps/app/src/shared/components/wizardDetailsDialog/wizardDetailsDialog.tsx).
 */
export interface WizardDetailsDialogProps {
  /** Title of the dialog. */
  title: string;
  /** Description of the dialog. */
  description: string;
  /** Steps of the dialog. */
  steps: IWizardDetailsDialogStep[];
  /** Link for further information. */
  infoLink?: string;
  /** Label of the button. */
  actionLabel: string;
  /** Href of where the wizard should link to. */
  wizardLink?: string;
  /** Callback on button click. */
  onActionClick?: () => void;
  /** Dialog ID. Needed to determine the specific dialog to close onActionClick to avoid closing all dialogs. */
  dialogId: string;
}

import type { IllustrationObjectType } from '@aragon/gov-ui-kit';

export interface IWizardDetailsDialogStep {
    /**
     * Label of the step.
     */
    label: string;
    /**
     * Icon of the step.
     */
    icon: IllustrationObjectType;
}

export declare const WizardDetailsDialog: React.ComponentType<WizardDetailsDialogProps>;
