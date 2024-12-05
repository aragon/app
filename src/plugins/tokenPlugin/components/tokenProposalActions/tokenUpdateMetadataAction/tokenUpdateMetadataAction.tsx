import { type IProposalAction } from '@/modules/governance/api/governanceService';
import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { UpdatePluginMetadataAction } from '@/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/updatePluginMetadataAction';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps } from '@aragon/gov-ui-kit';

export interface ITokenUpdatePluginMetadataActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<ITokenPluginSettings>>> {}

export const TokenUpdatePluginMetadataAction: React.FC<ITokenUpdatePluginMetadataActionProps> = (props) => {
    const { index, action } = props;

    return <UpdatePluginMetadataAction action={action} index={index} />;
};
