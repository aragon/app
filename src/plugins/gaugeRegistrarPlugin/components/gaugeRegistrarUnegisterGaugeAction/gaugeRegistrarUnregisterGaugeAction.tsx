import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalActionComponentProps, CardEmptyState, IconType } from '@aragon/gov-ui-kit';
import { useTranslations } from '../../../../shared/components/translationsProvider';

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

    return (
        <CardEmptyState
            heading={t('app.plugins.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.heading')}
            description={t('app.plugins.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.description')}
            objectIllustration={{ object: 'SETTINGS' }}
            secondaryButton={{
                label: t('app.plugins.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.action'),
                onClick: () => {},
                iconLeft: IconType.PLUS,
            }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
