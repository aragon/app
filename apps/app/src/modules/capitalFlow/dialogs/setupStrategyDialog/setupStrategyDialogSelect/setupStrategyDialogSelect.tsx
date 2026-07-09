import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    type ISetupStrategyForm,
    StrategyType,
} from '../setupStrategyDialogDefinitions';

export const SetupStrategyDialogSelect: React.FC = () => {
    const { t } = useTranslations();

    const { onChange: onStrategyTypeFieldChange, ...strategyTypeField } =
        useFormField<ISetupStrategyForm, 'type'>('type', {
            label: t('app.capitalFlow.setupStrategyDialog.select.type.label'),
            defaultValue: StrategyType.CAPITAL_ROUTER,
        });

    return (
        <RadioGroup
            helpText={t(
                'app.capitalFlow.setupStrategyDialog.select.type.helpText',
            )}
            onValueChange={onStrategyTypeFieldChange}
            {...strategyTypeField}
        >
            <RadioCard
                description={t(
                    'app.capitalFlow.setupStrategyDialog.select.capitalRouter.description',
                )}
                label={t(
                    'app.capitalFlow.setupStrategyDialog.select.capitalRouter.label',
                )}
                value={StrategyType.CAPITAL_ROUTER}
            />
            <RadioCard
                description={t(
                    'app.capitalFlow.setupStrategyDialog.select.capitalDistributor.description',
                )}
                disabled={true}
                label={t(
                    'app.capitalFlow.setupStrategyDialog.select.capitalDistributor.label',
                )}
                tag={{
                    variant: 'info',
                    label: t(
                        'app.capitalFlow.setupStrategyDialog.select.disabled.onRequest',
                    ),
                }}
                value={StrategyType.CAPITAL_DISTRIBUTOR}
            />
            <RadioCard
                description={t(
                    'app.capitalFlow.setupStrategyDialog.select.defiAdapter.description',
                )}
                disabled={true}
                label={t(
                    'app.capitalFlow.setupStrategyDialog.select.defiAdapter.label',
                )}
                tag={{
                    variant: 'info',
                    label: t(
                        'app.capitalFlow.setupStrategyDialog.select.disabled.soon',
                    ),
                }}
                value={StrategyType.DEFI_ADAPTER}
            />
        </RadioGroup>
    );
};
