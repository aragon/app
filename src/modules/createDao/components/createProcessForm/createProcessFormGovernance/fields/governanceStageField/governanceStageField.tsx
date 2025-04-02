import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/gov-ui-kit';
import type React from 'react';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    GovernanceType,
    type ICreateProcessFormData,
    type ICreateProcessFormStage,
    ProcessStageType,
} from '../../../createProcessFormDefinitions';
import { GovernanceBodiesField } from '../governanceBodiesField';
import { GovernanceStageApprovalsField } from '../governanceStageApprovalsField';
import { GovernanceStageTimingField } from '../governanceStageTimingField';
import { GovernanceStageTypeField } from '../governanceStageTypeField';

export interface IGovernanceStageFieldProps {
    /**
     * Prefix to be prepended to all form fields.
     */
    formPrefix: string;
    /**
     * Stage to display the details for.
     */
    stage: ICreateProcessFormStage;
    /**
     * Current number of stages.
     */
    stagesCount: number;
    /**
     * Callback called on delete button click.
     */
    onDelete: () => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const nameMaxLength = 40;

export const GovernanceStageField: React.FC<IGovernanceStageFieldProps> = (props) => {
    const { formPrefix, stage, stagesCount, onDelete, daoId } = props;

    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const stageType = useWatch<Record<string, ICreateProcessFormStage['type']>>({ name: `${formPrefix}.type` });

    const processBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const stageBodies = processBodies.filter((body) => body.stageId === stage.internalId);

    const stageError = 'app.createDao.createProcessForm.governance.stageField.error.requiredBodies';
    const validateStage = () =>
        stageType !== ProcessStageType.TIMELOCK && stageBodies.length === 0 ? stageError : undefined;

    const { alert: stageAlert } = useFormField<Record<string, ICreateProcessFormStage>, typeof formPrefix>(formPrefix, {
        rules: { validate: validateStage },
    });

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const stageNameField = useFormField<ICreateProcessFormStage, 'name'>('name', {
        label: t('app.createDao.createProcessForm.governance.stageField.name.label'),
        trimOnBlur: true,
        rules: { required: true, maxLength: nameMaxLength },
        fieldPrefix: formPrefix,
        defaultValue: '',
    });

    // Re-trigger stage required-body validation when user selects timelock stage type or adds a body. Do not trigger
    // validation on type / stage-bodies change otherwise the component would display the error on mount.
    useEffect(() => {
        if (isTimelockStage || stageBodies.length > 0) {
            void trigger(formPrefix);
        }
    }, [trigger, formPrefix, stageType, isTimelockStage, stageBodies.length]);

    return (
        <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
            <InputText
                helpText={t('app.createDao.createProcessForm.governance.stageField.name.helpText')}
                maxLength={nameMaxLength}
                {...stageNameField}
            />
            <GovernanceStageTypeField fieldPrefix={formPrefix} />
            <GovernanceStageTimingField fieldPrefix={`${formPrefix}.timing`} stageType={stageType} />
            {!isTimelockStage && (
                <GovernanceBodiesField
                    stageId={stage.internalId}
                    isOptimisticStage={isOptimisticStage}
                    governanceType={GovernanceType.ADVANCED}
                    alert={stageAlert}
                    daoId={daoId}
                />
            )}
            {stageBodies.length > 0 && (
                <GovernanceStageApprovalsField
                    fieldPrefix={formPrefix}
                    stageBodiesCount={stageBodies.length}
                    isOptimisticStage={isOptimisticStage}
                />
            )}
            {stagesCount > 1 && (
                <Dropdown.Container
                    constrainContentWidth={false}
                    size="md"
                    customTrigger={
                        <Button variant="tertiary" size="md" iconRight={IconType.DOTS_VERTICAL} className="self-end">
                            {t('app.createDao.createProcessForm.governance.stageField.action.more')}
                        </Button>
                    }
                >
                    <Dropdown.Item onClick={onDelete}>
                        {t('app.createDao.createProcessForm.governance.stageField.action.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </Card>
    );
};
