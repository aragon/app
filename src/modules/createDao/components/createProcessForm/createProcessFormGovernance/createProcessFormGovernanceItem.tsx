import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/gov-ui-kit';
import type React from 'react';
import { useWatch } from 'react-hook-form';
import {
    ProcessStageType,
    type ICreateProcessFormData,
    type ICreateProcessFormStage,
} from '../createProcessFormDefinitions';
import { GovernanceTypeField } from './fields/governanceTypeField';
import { GovernanceTimingField } from './fields/governanceTimingField';
import { GovernanceBodiesField } from './fields/governanceBodiesField';
import { GovernanceRequiredApprovalsField } from './fields/governanceRequiredApprovalsField';

export interface ICreateProcessFormGovernanceItemProps {
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
}

const nameMaxLength = 40;

export const CreateProcessFormGovernanceItem: React.FC<ICreateProcessFormGovernanceItemProps> = (props) => {
    const { formPrefix, stage, stagesCount, onDelete } = props;

    const { t } = useTranslations();

    useFormField<Record<string, ICreateProcessFormStage>, typeof formPrefix>(formPrefix);

    const stageType = useWatch<Record<string, ICreateProcessFormStage['type']>>({ name: `${formPrefix}.type` });

    const processBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const stageBodies = processBodies.filter((body) => body.stageId === stage.internalId);

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const stageNameField = useFormField<ICreateProcessFormStage, 'name'>('name', {
        label: t('app.createDao.createProcessForm.stages.name.label'),
        trimOnBlur: true,
        rules: { required: true, maxLength: nameMaxLength },
        fieldPrefix: formPrefix,
        defaultValue: '',
    });

    return (
        <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
            <InputText
                helpText={t('app.createDao.createProcessForm.stages.name.helpText')}
                maxLength={nameMaxLength}
                {...stageNameField}
            />
            <GovernanceTypeField fieldPrefix={formPrefix} />
            <GovernanceTimingField fieldPrefix={`${formPrefix}.timing`} stageType={stageType} />
            {!isTimelockStage && <GovernanceBodiesField stageId={stage.internalId} isOptimisticStage={isOptimisticStage} />}
            {stageBodies.length > 0 && (
                <GovernanceRequiredApprovalsField
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
                            {t('app.createDao.createProcessForm.stages.action.more')}
                        </Button>
                    }
                >
                    <Dropdown.Item onClick={onDelete}>
                        {t('app.createDao.createProcessForm.stages.action.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </Card>
    );
};
