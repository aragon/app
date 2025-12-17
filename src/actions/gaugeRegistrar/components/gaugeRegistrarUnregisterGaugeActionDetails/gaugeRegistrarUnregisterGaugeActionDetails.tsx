'use client';

import {
    addressUtils,
    DataList,
    EmptyState,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
} from '@aragon/gov-ui-kit';
import type { Address, Hex } from 'viem';
import { useReadContract } from 'wagmi';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { PluginInterfaceType, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { gaugeRegistrarAbi } from '../../constants/gaugeRegistrarAbi';
import { useAllGauges } from '../../hooks';
import type { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
import { GaugeRegistrarGaugeListItem, GaugeRegistrarGaugeListItemSkeleton } from '../gaugeRegistrarGaugeListItem';

export interface IGaugeRegistrarUnregisterGaugeActionDetailsProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const parseUnregisterGaugeInputData = (
    params: IProposalActionInputDataParameter[]
): {
    qiTokenAddress: string;
    incentiveType: number;
    rewardControllerAddress: string;
} => {
    const [qiTokenAddress, incentiveType, rewardControllerAddress] = params.map((param) => param.value);

    return {
        qiTokenAddress: typeof qiTokenAddress === 'string' ? qiTokenAddress : '',
        incentiveType: Number(incentiveType),
        rewardControllerAddress: typeof rewardControllerAddress === 'string' ? rewardControllerAddress : '',
    };
};

export const GaugeRegistrarUnregisterGaugeActionDetails: React.FC<IGaugeRegistrarUnregisterGaugeActionDetailsProps> = (props) => {
    const { action } = props;
    const pluginAddress = action.to;
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });
    const [gaugeVoterPlugin] =
        useDaoPlugins({
            daoId: action.daoId,
            interfaceType: PluginInterfaceType.GAUGE_VOTER,
        }) ?? [];
    const { t } = useTranslations();

    const { qiTokenAddress, incentiveType, rewardControllerAddress } = parseUnregisterGaugeInputData(action.inputData?.parameters ?? []);

    const { id: chainId } = networkDefinitions[dao!.network];

    const { data: gaugeAddress, isLoading: isGetGaugeAddressLoading } = useReadContract({
        address: pluginAddress as Address,
        abi: gaugeRegistrarAbi,
        functionName: 'getGaugeAddress',
        args: [qiTokenAddress as Address, incentiveType as GaugeIncentiveType, rewardControllerAddress as Address],
        chainId,
    });

    const { data: allGauges, isLoading: isAllGaugesLoading } = useAllGauges({
        gaugeListParams: {
            urlParams: {
                pluginAddress: gaugeVoterPlugin.meta.address as Hex,
                network: dao!.network,
            },
            queryParams: {},
        },
    });

    if (isGetGaugeAddressLoading || isAllGaugesLoading) {
        return <GaugeRegistrarGaugeListItemSkeleton />;
    }

    const gaugeToRemove = gaugeAddress ? allGauges.find((gauge) => addressUtils.isAddressEqual(gauge.address, gaugeAddress)) : undefined;

    if (!gaugeToRemove) {
        return (
            <DataList.Item>
                <EmptyState
                    description={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionDetails.notFound.description')}
                    heading={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionDetails.notFound.title')}
                    isStacked={false}
                    objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                />
            </DataList.Item>
        );
    }

    return (
        <GaugeRegistrarGaugeListItem
            gauge={{
                ...gaugeToRemove,
                gaugeAddress: gaugeToRemove.address,
                qiToken: qiTokenAddress,
                rewardController: rewardControllerAddress,
                incentive: incentiveType,
            }}
        />
    );
};
