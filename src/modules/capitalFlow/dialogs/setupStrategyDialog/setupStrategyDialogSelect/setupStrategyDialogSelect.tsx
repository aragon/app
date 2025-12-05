import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { StrategyType, type ISetupStrategyForm } from '../setupStrategyDialogDefinitions';

export const SetupStrategyDialogSelect: React.FC = () => {
    const { t } = useTranslations();

    const { onChange: onStrategyTypeFieldChange, ...strategyTypeField } = useFormField<ISetupStrategyForm, 'type'>(
        'type',
        {
            label: t('app.capitalFlow.setupStrategyDialog.select.type.label'),
            defaultValue: StrategyType.CAPITAL_ROUTER,
        },
    );

    return (
        <RadioGroup
            onValueChange={onStrategyTypeFieldChange}
            helpText={t('app.capitalFlow.setupStrategyDialog.select.type.helpText')}
            {...strategyTypeField}
        >
            <RadioCard
                label={t('app.capitalFlow.setupStrategyDialog.select.capitalRouter.label')}
                description={t('app.capitalFlow.setupStrategyDialog.select.capitalRouter.description')}
                value={StrategyType.CAPITAL_ROUTER}
            />
            <RadioCard
                label={t('app.capitalFlow.setupStrategyDialog.select.capitalDistributor.label')}
                description={t('app.capitalFlow.setupStrategyDialog.select.capitalDistributor.description')}
                value={StrategyType.CAPITAL_DISTRIBUTOR}
                disabled={true}
                tag={{ variant: 'info', label: t('app.capitalFlow.setupStrategyDialog.select.disabled.onRequest') }}
            />
            <RadioCard
                label={t('app.capitalFlow.setupStrategyDialog.select.defiAdapter.label')}
                description={t('app.capitalFlow.setupStrategyDialog.select.defiAdapter.description')}
                value={StrategyType.DEFI_ADAPTER}
                disabled={true}
                tag={{ variant: 'info', label: t('app.capitalFlow.setupStrategyDialog.select.disabled.soon') }}
            />
        </RadioGroup>
    );
};
