import { type IProposalAction } from '@/modules/governance/api/governanceService';
import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { UpdatePluginMetadataAction } from '@/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/updatePluginMetadataAction';
import type { ISppPluginSettings } from '@/plugins/sppPlugin/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps } from '@aragon/gov-ui-kit';

export interface ISppUpdatePluginMetadataActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<ISppPluginSettings>>> {}

export const SppUpdatePluginMetadataAction: React.FC<ISppUpdatePluginMetadataActionProps> = (props) => {
    const { index, action } = props;

    return <UpdatePluginMetadataAction action={action} index={index} />;
};
