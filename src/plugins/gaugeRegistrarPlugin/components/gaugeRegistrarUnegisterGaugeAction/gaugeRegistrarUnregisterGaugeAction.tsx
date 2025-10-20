import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps } from '@aragon/gov-ui-kit';

export interface IGaugeRegistrarUnregisterGaugeActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}

const unregisterGaugeAbi = {
    type: 'function',
    name: 'unregisterGauge',
    inputs: [
        { internalType: 'address', name: '_qiToken', type: 'address' },
        { internalType: 'Incentive', name: '_incentive', type: 'uint8' },
        { internalType: 'address', name: '_rewardController', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
} as const;

export const GaugeRegistrarUnregisterGaugeAction: React.FC<IGaugeRegistrarUnregisterGaugeActionProps> = (props) => {
    return <h1>Unregister Gauge!</h1>;
};
