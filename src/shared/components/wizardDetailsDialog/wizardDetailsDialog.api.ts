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

interface ILink {
    /**
     * Label of the link.
     */
    label: string;
    /**
     * URL of the link.
     */
    href: string;
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
     * Primary button config
     */
    primaryButton: IButtonConfig;
    /**
     * Link for further information.
     */
    link?: ILink;
}
