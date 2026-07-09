import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    type ISetupStrategyForm,
    RouterType,
} from '../setupStrategyDialogDefinitions';

export const SetupStrategyDialogRouterType: React.FC = () => {
    const { t } = useTranslations();

    const { onChange: onRouterTypeChange, ...routerTypeField } = useFormField<
        ISetupStrategyForm,
        'routerType'
    >('routerType', {
        label: t('app.capitalFlow.setupStrategyDialog.routerType.label'),
        defaultValue: RouterType.FIXED,
    });

    return (
        <RadioGroup
            helpText={t(
                'app.capitalFlow.setupStrategyDialog.routerType.helpText',
            )}
            onValueChange={onRouterTypeChange}
            {...routerTypeField}
        >
            <RadioCard
                description={t(
                    `app.capitalFlow.strategyType.${RouterType.FIXED}.description`,
                )}
                label={t(
                    `app.capitalFlow.strategyType.${RouterType.FIXED}.label`,
                )}
                value={RouterType.FIXED}
            />
            <RadioCard
                description={t(
                    `app.capitalFlow.strategyType.${RouterType.GAUGE}.description`,
                )}
                label={t(
                    `app.capitalFlow.strategyType.${RouterType.GAUGE}.label`,
                )}
                value={RouterType.GAUGE}
            />
            <RadioCard
                description={t(
                    `app.capitalFlow.strategyType.${RouterType.STREAM}.description`,
                )}
                label={t(
                    `app.capitalFlow.strategyType.${RouterType.STREAM}.label`,
                )}
                value={RouterType.STREAM}
            />
            <RadioCard
                description={t(
                    `app.capitalFlow.strategyType.${RouterType.BURN}.description`,
                )}
                label={t(
                    `app.capitalFlow.strategyType.${RouterType.BURN}.label`,
                )}
                value={RouterType.BURN}
            />
            <RadioCard
                description={t(
                    `app.capitalFlow.strategyType.${RouterType.DEX_SWAP}.description`,
                )}
                label={t(
                    `app.capitalFlow.strategyType.${RouterType.DEX_SWAP}.label`,
                )}
                value={RouterType.DEX_SWAP}
            />
            <RadioCard
                description={t(
                    `app.capitalFlow.strategyType.${RouterType.MULTI_DISPATCH}.description`,
                )}
                label={t(
                    `app.capitalFlow.strategyType.${RouterType.MULTI_DISPATCH}.label`,
                )}
                value={RouterType.MULTI_DISPATCH}
            />
            <RadioCard
                description={t(
                    `app.capitalFlow.strategyType.${RouterType.UNISWAP}.description`,
                )}
                label={t(
                    `app.capitalFlow.strategyType.${RouterType.UNISWAP}.label`,
                )}
                value={RouterType.UNISWAP}
            />
        </RadioGroup>
    );
};
