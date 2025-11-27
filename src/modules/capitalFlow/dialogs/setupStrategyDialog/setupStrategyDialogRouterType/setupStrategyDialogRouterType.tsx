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
                label={t('app.capitalFlow.setupStrategyDialog.routerType.fixed.label')}
                description={t('app.capitalFlow.setupStrategyDialog.routerType.fixed.description')}
                value={RouterType.FIXED}
            />
            <RadioCard
                label={t('app.capitalFlow.setupStrategyDialog.routerType.stream.label')}
                description={t('app.capitalFlow.setupStrategyDialog.routerType.stream.description')}
                value={RouterType.STREAM}
            />
        </RadioGroup>
    );
};
