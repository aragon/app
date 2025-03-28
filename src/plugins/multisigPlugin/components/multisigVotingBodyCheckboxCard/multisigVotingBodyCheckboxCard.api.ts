import type { ICreateProcessFormData } from '@/modules/createDao/components/createProcessForm';

export interface IMultisigVotingBodyCheckboxCardProps {
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
}
