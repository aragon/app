import type { ICreateProcessFormData } from '@/modules/createDao/components/createProcessForm';
export interface ITokenVotingBodySettings {
    /**
     * Min voting power / balance the user needs to have for creating proposals
     */
    minVotingPower?: string;
}

export interface ITokenVotingBodyCheckboxCardProps {
    /**
     * Body to render the checkbox card for.
     */
    body: ICreateProcessFormData['bodies'][number];
    /**
     * Callback called on body checkbox change.
     */
    onChange: (bodyId: string, checked: boolean) => void;
    /**
     * Defines if the body is checked or not.
     */
    checked: boolean;
    /**
     * Prefix to be used for the body permission settings.
     */
    fieldPrefix: string;
}
