import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps } from '@aragon/gov-ui-kit';

export interface IGaugeRegistrarRegisterGaugeActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}

const registerGaugeAbi = {
    type: 'function',
    name: 'registerGauge',
    inputs: [
        { internalType: 'address', name: '_qiToken', type: 'address' },
        { internalType: 'contract Incentive', name: '_incentive', type: 'address' },
        { internalType: 'address', name: '_rewardController', type: 'address' },
        { internalType: 'string', name: '_metadataURI', type: 'string' },
    ],
    outputs: [{ internalType: 'address', name: 'gaugeAddress', type: 'address' }],
    stateMutability: 'nonpayable',
} as const;

export const GaugeRegistrarRegisterGaugeAction: React.FC<IGaugeRegistrarRegisterGaugeActionProps> = (props) => {
    return <h1>Register Gauge!</h1>;
};
