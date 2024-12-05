import { type IProposalAction } from '@/modules/governance/api/governanceService';
import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { UpdatePluginMetadataAction } from '@/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/updatePluginMetadataAction';
import { type IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps } from '@aragon/gov-ui-kit';

export interface IMultisigUpdatePluginMetadataActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<IMultisigPluginSettings>>> {}

export const MultisigUpdatePluginMetadataAction: React.FC<IMultisigUpdatePluginMetadataActionProps> = (props) => {
    const { index, action } = props;

    return <UpdatePluginMetadataAction action={action} index={index} />;
};
