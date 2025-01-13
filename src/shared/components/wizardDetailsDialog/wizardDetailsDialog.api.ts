import type { IIllustrationObjectProps } from '@aragon/gov-ui-kit';

interface IWizardDetailsDialogStep {
    /**
     * Label of the step.
     */
    label: string;
    /**
     * Icon of the step.
     */
    icon: IIllustrationObjectProps['object'];
}

interface IButtonConfig {
    /**
     * Label of the button.
     */
    label: string;
    /**
     * Callback of the button.
     */
    onPrimaryButtonClick?: () => void;
    /**
     * URL of the button.
     */
    href?: string;
}

export interface IWizardDetailsDialogParams {
    /**
     * Title of the dialog.
     */
    title: string;
    /**
     * Description of the dialog.
     */
    description: string;
    /**
     * Steps of the dialog.
     */
    steps: IWizardDetailsDialogStep[];
    /**
     * Primary button config
     */
    primaryButton: IButtonConfig;
}
