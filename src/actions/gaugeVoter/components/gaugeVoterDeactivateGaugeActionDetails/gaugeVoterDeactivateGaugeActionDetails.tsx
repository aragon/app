'use client';

import {
    addressUtils,
    DataList,
    EmptyState,
    type IProposalAction,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useAllGauges } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { gaugeVoterActionParser } from '../../utils/gaugeVoterActionParser';
import {
    GaugeVoterGaugeListItem,
    GaugeVoterGaugeListItemSkeleton,
} from '../gaugeVoterGaugeListItem';

export interface IGaugeVoterDeactivateGaugeActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const GaugeVoterDeactivateGaugeActionDetails: React.FC<
    IGaugeVoterDeactivateGaugeActionDetailsProps
> = (props) => {
    const { action } = props;
    const pluginAddress = action.to;
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });
    const { t } = useTranslations();

    const { gaugeAddress } = gaugeVoterActionParser.parseInputData(
        action.inputData?.parameters ?? [],
    );

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

    const gaugeToDeactivate = gaugeAddress
        ? allGauges.find((gauge) =>
              addressUtils.isAddressEqual(gauge.address, gaugeAddress),
          )
        : undefined;

    if (!gaugeToDeactivate) {
        return (
            <DataList.Item>
                <EmptyState
                    description={t(
                        'app.actions.gaugeVoter.gaugeVoterDeactivateGaugeActionDetails.notFound.description',
                    )}
                    heading={t(
                        'app.actions.gaugeVoter.gaugeVoterDeactivateGaugeActionDetails.notFound.title',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                />
            </DataList.Item>
        );
    }

    return <GaugeVoterGaugeListItem gauge={gaugeToDeactivate} />;
};
