import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { RegisterGaugeForm } from './registerGaugeForm';

export interface IGaugeRegistrarRegisterGaugeActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}

const registerGaugeAbi = {
    type: 'function',
    name: 'registerGauge',
    inputs: [
        { internalType: 'address', name: '_qiToken', type: 'address' },
        { internalType: 'enum Incentive', name: '_incentive', type: 'uint8' },
        { internalType: 'address', name: '_rewardController', type: 'address' },
        { internalType: 'string', name: '_metadataURI', type: 'string' },
    ],
    outputs: [{ internalType: 'address', name: 'gaugeAddress', type: 'address' }],
    stateMutability: 'nonpayable',
} as const;

export const GaugeRegistrarRegisterGaugeAction: React.FC<IGaugeRegistrarRegisterGaugeActionProps> = (props) => {
    const { index, action } = props;
    const actionFieldName = `actions.[${index.toString()}]`;

    return <RegisterGaugeForm fieldPrefix={actionFieldName} />;
};
