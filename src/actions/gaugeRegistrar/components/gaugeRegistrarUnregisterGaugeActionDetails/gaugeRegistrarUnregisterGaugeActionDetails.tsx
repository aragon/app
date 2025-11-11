'use client';

import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { PluginInterfaceType, useDao } from '@/shared/api/daoService';
import {
    addressUtils,
    DataList,
    EmptyState,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
} from '@aragon/gov-ui-kit';

import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useGaugeRegistrarGauges } from '../../hooks';
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
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });
    const [gaugeVoterPlugin] =
        useDaoPlugins({ daoId: action.daoId, interfaceType: PluginInterfaceType.GAUGE_VOTER }) ?? [];
    const { t } = useTranslations();

    const { qiTokenAddress, incentiveType, rewardControllerAddress } = parseUnregisterGaugeInputData(
        action.inputData?.parameters ?? [],
    );
    const { data: gauges = [], isLoading } = useGaugeRegistrarGauges({
        pluginAddress,
        network: dao!.network,
        gaugeVoterAddress: gaugeVoterPlugin.meta.address,
    });

    if (isLoading) {
        return <GaugeRegistrarGaugeListItemSkeleton />;
    }

    const gaugeToRemove = gauges.find(
        (gauge) =>
            addressUtils.isAddressEqual(gauge.qiToken, qiTokenAddress) &&
            addressUtils.isAddressEqual(gauge.rewardController, rewardControllerAddress) &&
            gauge.incentive == incentiveType,
    );

    if (!gaugeToRemove) {
        return (
            <DataList.Item>
                <EmptyState
                    heading={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionDetails.notFound.title')}
                    description={t(
                        'app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionDetails.notFound.description',
                    )}
                    objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    isStacked={false}
                />
            </DataList.Item>
        );
    }

    return <GaugeRegistrarGaugeListItem gauge={gaugeToRemove} />;
};
