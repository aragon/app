import { CardEmptyState, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CapitalFlowDialogId } from '../../../constants/capitalFlowDialogId';
import type { ISetupStrategyDialogParams, ISetupStrategyForm } from '../../../dialogs/setupStrategyDialog';
import type { ICreatePolicyFormData } from '../createPolicyFormDefinitions';
import { CreatePolicyStrategyDetails } from './createPolicyStrategyDetails';

export interface ICreatePolicyFormConfigureProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const CreatePolicyFormConfigure: React.FC<ICreatePolicyFormConfigureProps> = (props) => {
    const { daoId } = props;
    const strategyFieldName = 'strategy' as const;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { setValue } = useFormContext<ICreatePolicyFormData>();

    const setSelectedStrategy = (strategy: ISetupStrategyForm) => {
        setValue(strategyFieldName, strategy, {
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
        setValue(strategyFieldName, undefined, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    return (
        <InputContainer
            alert={alert}
            helpText={t('app.capitalFlow.createPolicyForm.configure.strategy.helpText')}
            id="policyStrategy"
            label={t('app.capitalFlow.createPolicyForm.configure.strategy.label')}
            useCustomWrapper={true}
        >
            {selectedStrategy == null ? (
                <CardEmptyState
                    className="border border-neutral-100"
                    description={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.description')}
                    heading={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.heading')}
                    isStacked={false}
                    objectIllustration={{ object: 'SETTINGS' }}
                    secondaryButton={{
                        label: t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.action'),
                        onClick: handleOpenStrategyDialog,
                        iconLeft: IconType.PLUS,
                    }}
                />
            ) : (
                <CreatePolicyStrategyDetails
                    onEdit={handleOpenStrategyDialog}
                    onRemove={handleRemoveStrategy}
                    strategy={selectedStrategy}
                />
            )}
        </InputContainer>
    );
};
