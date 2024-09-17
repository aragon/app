import { TransferAssetForm } from '@/modules/finance/components/transferAssetForm';
import type { IProposalActionWithdrawToken } from '@/modules/governance/api/governanceService';
import { useDao } from '@/shared/api/daoService';
import type { IProposalActionComponentProps } from '@aragon/ods';
import type { IProposalActionIndexed } from '../../../createProposalFormDefinitions';

export interface ITransferAssetActionProps
    extends IProposalActionComponentProps<IProposalActionIndexed<IProposalActionWithdrawToken>> {}

export const TransferAssetAction: React.FC<ITransferAssetActionProps> = (props) => {
    const { action } = props;

    const fieldName = `actions.[${action.index}]`;

    const daoUrlParams = { id: action.daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    return <TransferAssetForm sender={dao!.address} network={dao!.network} fieldPrefix={fieldName} />;
};
