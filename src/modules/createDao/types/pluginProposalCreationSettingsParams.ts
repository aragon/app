import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ProposalCreationMode } from '../components/createProcessForm';
import type { ISetupBodyForm, ISetupBodyFormMembership } from '../dialogs/setupBodyDialog';

export interface IPluginProposalCreationSettingsParams<
    TGovernance = unknown,
    TMember extends ICompositeAddress = ICompositeAddress,
    TMembership extends ISetupBodyFormMembership<TMember> = ISetupBodyFormMembership<TMember>,
> {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
    /**
     * Body to setup the proposal creation params for.
     */
    body: ISetupBodyForm<TGovernance, TMember, TMembership>;
    /**
     * Current selection for the proposal creation settings.
     */
    mode: ProposalCreationMode;
}
