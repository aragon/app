'use client';

import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useAllGauges } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    addressUtils,
    DataList,
    EmptyState,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
} from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { GaugeVoterGaugeListItem, GaugeVoterGaugeListItemSkeleton } from '../gaugeVoterGaugeListItem';

export interface IGaugeVoterActivateGaugeActionDetailsProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const parseActivateGaugeInputData = (params: IProposalActionInputDataParameter[]): { gaugeAddress: string } => {
    const [gaugeAddress] = params.map((param) => param.value);

    return {
        gaugeAddress: typeof gaugeAddress === 'string' ? gaugeAddress : '',
    };
};

export const GaugeVoterActivateGaugeActionDetails: React.FC<IGaugeVoterActivateGaugeActionDetailsProps> = (props) => {
    const { action } = props;
    const pluginAddress = action.to;
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });
    const { t } = useTranslations();

    const { gaugeAddress } = parseActivateGaugeInputData(action.inputData?.parameters ?? []);

    const { data: allGauges, isLoading: isAllGaugesLoading } = useAllGauges({
        gaugeListParams: {
            urlParams: {
                pluginAddress: pluginAddress as Hex,
                network: dao!.network,
            },
            queryParams: {},
        },
    });

    if (isAllGaugesLoading) {
        return <GaugeVoterGaugeListItemSkeleton />;
    }

    const gaugeToActivate = gaugeAddress
        ? allGauges.find((gauge) => addressUtils.isAddressEqual(gauge.address, gaugeAddress))
        : undefined;

    if (!gaugeToActivate) {
        return (
            <DataList.Item>
                <EmptyState
                    heading={t('app.actions.gaugeVoter.gaugeVoterActivateGaugeActionDetails.notFound.title')}
                    description={t('app.actions.gaugeVoter.gaugeVoterActivateGaugeActionDetails.notFound.description')}
                    objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    isStacked={false}
                />
            </DataList.Item>
        );
    }

    return <GaugeVoterGaugeListItem gauge={gaugeToActivate} />;
};
