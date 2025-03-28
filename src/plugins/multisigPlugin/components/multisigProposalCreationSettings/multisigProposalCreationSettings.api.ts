import type { ISetupBodyForm } from "@/modules/createDao/dialogs/setupBodyDialog";

export interface IMultisigProposalCreationSettingsProps {
    /**
     * Body to render the checkbox card for.
     */
    body: ISetupBodyForm
    /**
     * Callback called on body checkbox change.
     */
    onChange: (bodyId: string, checked: boolean) => void;
    /**
     * Defines if the body is checked or not.
     */
    checked: boolean;
}
