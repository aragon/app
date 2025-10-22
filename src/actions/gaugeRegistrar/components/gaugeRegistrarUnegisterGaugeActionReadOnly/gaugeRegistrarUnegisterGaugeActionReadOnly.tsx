'use client';

import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { type IProposalActionComponentProps, Spinner } from '@aragon/gov-ui-kit';
import { type IDaoPlugin, Network } from '../../../../shared/api/daoService';
import { useDialogContext } from '../../../../shared/components/dialogProvider';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { useGaugeRegistrarGauges } from '../../hooks/useGaugeRegistrarGauges';

export interface IGaugeRegistrarUnregisterGaugeActionReadOnlyProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}

export const GaugeRegistrarUnegisterGaugeActionReadOnly: React.FC<IGaugeRegistrarUnregisterGaugeActionReadOnlyProps> = (
    props,
) => {
    const { action } = props;
    const pluginAddress = action.to;
    // const network = action.meta.address;
    const [qiToken, incentive, rewardController] = action.inputData?.parameters ?? [];

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { data: gauges, isLoading } = useGaugeRegistrarGauges({ pluginAddress, network: Network.ARBITRUM_MAINNET });

    if (isLoading) {
        return <Spinner />;
    }
};
