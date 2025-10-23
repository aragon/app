'use client';

import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import {
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
    Spinner,
} from '@aragon/gov-ui-kit';
import { type IDaoPlugin, useDao } from '../../../../shared/api/daoService';
import { useGaugeRegistrarGauges } from '../../hooks/useGaugeRegistrarGauges';
import { GaugeRegistrarGaugeListItem } from '../gaugeRegistrarGaugeListItem';

export interface IGaugeRegistrarUnregisterGaugeActionReadOnlyProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}

const parseUnregisterGaugeInputData = (
    params: IProposalActionInputDataParameter[],
): { qiTokenAddress: string; incentiveType: number; rewardControllerAddress: string } => {
    const [qiTokenAddress, incentiveType, rewardControllerAddress] = params.map((param) => param.value);

    return {
        qiTokenAddress: typeof qiTokenAddress === 'string' ? qiTokenAddress : '',
        incentiveType: Number(incentiveType),
        rewardControllerAddress: typeof rewardControllerAddress === 'string' ? rewardControllerAddress : '',
    };
};

export const GaugeRegistrarUnegisterGaugeActionReadOnly: React.FC<IGaugeRegistrarUnregisterGaugeActionReadOnlyProps> = (
    props,
) => {
    const { action } = props;
    const pluginAddress = action.to;
    console.log('action', props);
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    const { qiTokenAddress, incentiveType, rewardControllerAddress } = parseUnregisterGaugeInputData(
        action.inputData?.parameters ?? [],
    );
    const { data: gauges, isLoading } = useGaugeRegistrarGauges({
        pluginAddress,
        network: dao!.network,
        gaugeVoterAddress: 'plugin.meta.address',
    });

    if (isLoading) {
        return <Spinner />;
    }

    const gaugeToRemove = gauges[0];
    // const gaugeToRemove = gauges.find(
    //     (gauge) =>
    //         gauge.qiToken === qiTokenAddress &&
    //         gauge.rewardController === rewardControllerAddress &&
    //         gauge.incentive === incentiveType,
    // );

    if (!gaugeToRemove) {
        return <p>Can&#39;t find a gauge.</p>;
    }

    return <GaugeRegistrarGaugeListItem gauge={gaugeToRemove} />;
};
