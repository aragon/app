import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CardEmptyState, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { FieldPath, useFormContext } from 'react-hook-form';
import { CapitalFlowDialogId } from '../../../constants/capitalFlowDialogId';
import type { ISetupStrategyDialogParams } from '../../../dialogs/setupStrategyDialog';
import type { ISetupStrategyForm } from '../../../dialogs/setupStrategyDialog/setupStrategyDialogDefinitions';
import type { ICreatePolicyFormData } from '../createPolicyFormDefinitions';
import { CreatePolicyStrategyDetails } from './createPolicyStrategyDetails';

export interface ICreatePolicyFormConfigureProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const CreatePolicyFormConfigure: React.FC<ICreatePolicyFormConfigureProps> = (props) => {
    const { fieldPrefix, daoId } = props;
    const strategyFieldName = fieldPrefix != null ? `${fieldPrefix}.strategy` : 'strategy';

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { setValue } = useFormContext<ICreatePolicyFormData>();

    const setSelectedStrategy = (strategy: ISetupStrategyForm) => {
        setValue(strategyFieldName as FieldPath<ICreatePolicyFormData>, strategy, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const { value: selectedStrategy, alert } = useFormField<ICreatePolicyFormData, 'strategy'>('strategy', {
        label: t('app.capitalFlow.createPolicyForm.configure.strategy.label'),
        rules: {
            required: true,
        },
        fieldPrefix,
    });

    const handleOpenStrategyDialog = () => {
        const params: ISetupStrategyDialogParams = {
            daoId,
            onSubmit: (strategy: ISetupStrategyForm) => {
                setSelectedStrategy(strategy);
                close(CapitalFlowDialogId.SETUP_STRATEGY);
            },
            initialValues: selectedStrategy,
        };

        open(CapitalFlowDialogId.SETUP_STRATEGY, { params });
    };

    const handleRemoveStrategy = () => {
        setValue(strategyFieldName as FieldPath<ICreatePolicyFormData>, undefined, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
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
                {selectedStrategy == null ? (
                    <CardEmptyState
                        heading={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.heading')}
                        description={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.description')}
                        objectIllustration={{ object: 'SETTINGS' }}
                        secondaryButton={{
                            label: t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.action'),
                            onClick: handleOpenStrategyDialog,
                            iconLeft: IconType.PLUS,
                        }}
                        isStacked={false}
                        className="border border-neutral-100"
                    />
                ) : (
                    <CreatePolicyStrategyDetails
                        strategy={selectedStrategy}
                        onEdit={handleOpenStrategyDialog}
                        onRemove={handleRemoveStrategy}
                    />
                )}
            </InputContainer>
        </>
    );
};
