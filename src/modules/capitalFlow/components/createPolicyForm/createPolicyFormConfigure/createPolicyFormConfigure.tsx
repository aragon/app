import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CardEmptyState, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import type { IRegisteredGauge } from '../../../../../actions/gaugeRegistrar/types/gaugeRegistrar';
import { CapitalFlowDialogId } from '../../../constants/capitalFlowDialogId';
import type { ISetupStrategyDialogParams } from '../../../dialogs/setupStrategyDialog';

export interface ICreatePolicyFormConfigureProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

export const CreatePolicyFormConfigure: React.FC<ICreatePolicyFormConfigureProps> = (props) => {
    const { fieldPrefix } = props;
    const strategyFieldName = `${fieldPrefix}.strategy`;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();

    const setSelectedStrategy = (strategy?: IRegisteredGauge) => {
        setValue(strategyFieldName, strategy);
    };

    const { value: selectedGauge, alert } = useFormField<Record<string, IRegisteredGauge | undefined>, string>(
        strategyFieldName,
        {
            label: t('app.capitalFlow.createPolicyForm.configure.strategy.label'),
            rules: {
                required: true,
            },
        },
    );

    const handleOpenGaugeSelectDialog = () => {
        const params: ISetupStrategyDialogParams = {
            onSubmit: () => {},
        };

        open(CapitalFlowDialogId.SETUP_STRATEGY, { params });
    };

    return (
        <>
            <InputContainer
                id="policyStrategy"
                label={t('app.capitalFlow.createPolicyForm.configure.strategy.label')}
                helpText={t('app.capitalFlow.createPolicyForm.configure.strategy.helpText')}
                useCustomWrapper={true}
                alert={alert}
            >
                <CardEmptyState
                    heading={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.heading')}
                    description={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.description')}
                    objectIllustration={{ object: 'SETTINGS' }}
                    secondaryButton={{
                        label: t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.action'),
                        onClick: handleOpenGaugeSelectDialog,
                        iconLeft: IconType.PLUS,
                    }}
                    isStacked={false}
                    className="border border-neutral-100"
                />
            </InputContainer>
        </>
    );
};
