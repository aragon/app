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

export interface IWizardDetailsDialogProps {
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
     * Link for further information.
     */
    infoLink?: string;
    /**
     * Label of the button.
     */
    actionLabel: string;
    /**
     * Href of where the wizard should link to.
     */
    wizardLink?: string;
    /**
     * Callback on button click.
     */
    onPrimaryButtonClick?: () => void;
}
