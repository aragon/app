import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { RouterType, type ISetupStrategyForm } from '../setupStrategyDialogDefinitions';

export const SetupStrategyDialogRouterType: React.FC = () => {
    const { t } = useTranslations();

    const { onChange: onRouterTypeChange, ...routerTypeField } = useFormField<ISetupStrategyForm, 'routerType'>(
        'routerType',
        {
            label: t('app.capitalFlow.setupStrategyDialog.routerType.label'),
            defaultValue: RouterType.FIXED,
        },
    );

    return (
        <RadioGroup
            onValueChange={onRouterTypeChange}
            helpText={t('app.capitalFlow.setupStrategyDialog.routerType.helpText')}
            {...routerTypeField}
        >
            <RadioCard
                label={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.FIXED}.label`)}
                description={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.FIXED}.description`)}
                value={RouterType.FIXED}
            />
            <RadioCard
                label={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.GAUGE}.label`)}
                description={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.GAUGE}.description`)}
                value={RouterType.GAUGE}
            />
            <RadioCard
                label={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.STREAM}.label`)}
                description={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.STREAM}.description`)}
                value={RouterType.STREAM}
            />
            <RadioCard
                label={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.BURN}.label`)}
                description={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.BURN}.description`)}
                value={RouterType.BURN}
            />
            <RadioCard
                label={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.DEX_SWAP}.label`)}
                description={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.DEX_SWAP}.description`)}
                value={RouterType.DEX_SWAP}
            />
            <RadioCard
                label={t(`app.capitalFlow.setupStrategyDialog.routerType.${RouterType.MULTI_DISPATCH}.label`)}
                description={t(
                    `app.capitalFlow.setupStrategyDialog.routerType.${RouterType.MULTI_DISPATCH}.description`,
                )}
                value={RouterType.MULTI_DISPATCH}
            />
        </RadioGroup>
    );
};
