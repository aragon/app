import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps, CardEmptyState, IconType } from '@aragon/gov-ui-kit';
import { useDialogContext } from '../../../../shared/components/dialogProvider';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { GaugeRegistrarPluginDialogId } from '../../constants/gaugeRegistrarPluginDialogId';

export interface IGaugeRegistrarUnregisterGaugeActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}

const unregisterGaugeAbi = {
    type: 'function',
    name: 'unregisterGauge',
    inputs: [
        { internalType: 'address', name: '_qiToken', type: 'address' },
        { internalType: 'enum Incentive', name: '_incentive', type: 'uint8' },
        { internalType: 'address', name: '_rewardController', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
} as const;

export const GaugeRegistrarUnregisterGaugeAction: React.FC<IGaugeRegistrarUnregisterGaugeActionProps> = (props) => {
    const { t } = useTranslations();
    const { open } = useDialogContext();

    return (
        <CardEmptyState
            heading={t('app.plugins.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.heading')}
            description={t('app.plugins.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.description')}
            objectIllustration={{ object: 'SETTINGS' }}
            secondaryButton={{
                label: t('app.plugins.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.action'),
                onClick: () => open(GaugeRegistrarPluginDialogId.SELECT_GAUGE, { params: {} }),
                iconLeft: IconType.PLUS,
            }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
