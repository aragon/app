'use client';

import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useDao } from '@/shared/api/daoService';
import {
    DataList,
    EmptyState,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
} from '@aragon/gov-ui-kit';

import { useTranslations } from '../../../../shared/components/translationsProvider';
import { useGaugeRegistrarGauges } from '../../hooks/useGaugeRegistrarGauges';
import { GaugeRegistrarGaugeListItem, GaugeRegistrarGaugeListItemSkeleton } from '../gaugeRegistrarGaugeListItem';

export interface IGaugeRegistrarUnregisterGaugeActionDetailsProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

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

export const GaugeRegistrarUnregisterGaugeActionDetails: React.FC<IGaugeRegistrarUnregisterGaugeActionDetailsProps> = (
    props,
) => {
    const { action } = props;
    const pluginAddress = action.to;
    console.log('action', props);
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });
    const { t } = useTranslations();

    const { qiTokenAddress, incentiveType, rewardControllerAddress } = parseUnregisterGaugeInputData(
        action.inputData?.parameters ?? [],
    );
    const { data: gauges, isLoading } = useGaugeRegistrarGauges({
        pluginAddress,
        network: dao!.network,
        gaugeVoterAddress: 'plugin.meta.address',
    });

    if (isLoading) {
        return <GaugeRegistrarGaugeListItemSkeleton />;
    }

    const gaugeToRemove = gauges[0];
    // const gaugeToRemove = gauges.find(
    //     (gauge) =>
    //         gauge.qiToken === qiTokenAddress &&
    //         gauge.rewardController === rewardControllerAddress &&
    //         gauge.incentive === incentiveType,
    // );

    if (!gaugeToRemove) {
        return (
            <DataList.Item>
                <EmptyState
                    heading={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionReadOnly.notFound.title')}
                    description={t(
                        'app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionReadOnly.notFound.description',
                    )}
                    objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    isStacked={false}
                />
            </DataList.Item>
        );
    }

    return <GaugeRegistrarGaugeListItem gauge={gaugeToRemove} />;
};
