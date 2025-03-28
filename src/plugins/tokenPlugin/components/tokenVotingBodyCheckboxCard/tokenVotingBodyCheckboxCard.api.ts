import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { ITokenMember } from '../../types';

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
    body: ISetupBodyForm<ITokenVotingBodySettings, ITokenMember>;
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
