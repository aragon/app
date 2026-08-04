'use client';

import {
    addressUtils,
    DataList,
    EmptyState,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
    invariant,
} from '@aragon/gov-ui-kit';
import type { Address, Hex } from 'viem';
import { useReadContract } from 'wagmi';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useAllGauges } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { PluginInterfaceType, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { gaugeRegistrarAbi } from '../../constants/gaugeRegistrarAbi';
import type { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
import {
    GaugeRegistrarGaugeListItem,
    GaugeRegistrarGaugeListItemSkeleton,
} from '../gaugeRegistrarGaugeListItem';

export interface IGaugeRegistrarUnregisterGaugeActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

const parseUnregisterGaugeInputData = (
    params: IProposalActionInputDataParameter[],
): {
    qiTokenAddress: string;
    incentiveType: number;
    rewardControllerAddress: string;
} => {
    const [qiTokenAddress, incentiveType, rewardControllerAddress] = params.map(
        (param) => param.value,
    );

    return {
        qiTokenAddress:
            typeof qiTokenAddress === 'string' ? qiTokenAddress : '',
        incentiveType: Number(incentiveType),
        rewardControllerAddress:
            typeof rewardControllerAddress === 'string'
                ? rewardControllerAddress
                : '',
    };
};

export const GaugeRegistrarUnregisterGaugeActionDetails: React.FC<
    IGaugeRegistrarUnregisterGaugeActionDetailsProps
> = (props) => {
    const { action } = props;

    // The view resolves its DAO data from the action, so it only supports actions composed in DAO context.
    invariant(
        action.daoId != null,
        'GaugeRegistrarUnregisterGaugeActionDetails: daoId must be set on the action.',
    );
    const pluginAddress = action.to;
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });
    const [gaugeVoterPlugin] =
        useDaoPlugins({
            daoId: action.daoId,
            interfaceType: PluginInterfaceType.GAUGE_VOTER,
            includeLinkedAccounts: false,
        }) ?? [];
    const { t } = useTranslations();

    const { qiTokenAddress, incentiveType, rewardControllerAddress } =
        parseUnregisterGaugeInputData(action.inputData?.parameters ?? []);

    const { id: chainId } = networkDefinitions[dao!.network];

    const { data: gaugeAddress, isLoading: isGetGaugeAddressLoading } =
        useReadContract({
            address: pluginAddress as Address,
            abi: gaugeRegistrarAbi,
            functionName: 'getGaugeAddress',
            args: [
                qiTokenAddress as Address,
                incentiveType as GaugeIncentiveType,
                rewardControllerAddress as Address,
            ],
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

    const gaugeToRemove = gaugeAddress
        ? allGauges.find((gauge) =>
              addressUtils.isAddressEqual(gauge.address, gaugeAddress),
          )
        : undefined;

    if (!gaugeToRemove) {
        return (
            <DataList.Item>
                <EmptyState
                    description={t(
                        'app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionDetails.notFound.description',
                    )}
                    heading={t(
                        'app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionDetails.notFound.title',
                    )}
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
