import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/gov-ui-kit';
import type React from 'react';
import { useWatch } from 'react-hook-form';
import {
    type ICreateProcessFormData,
    type ICreateProcessFormStage,
    ProcessStageType,
} from '../../../createProcessFormDefinitions';
import { GovernanceBodiesField } from '../governanceBodiesField';
import { GovernanceStageApprovalsField } from '../governanceStageApprovalsField';
import { GovernanceStageTimingField } from '../governanceStageTimingField';
import { GovernanceStageTypeField } from '../governanceStageTypeField';

export interface IGovernanceStageProps {
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

export const GovernanceStage: React.FC<IGovernanceStageProps> = (props) => {
    const { formPrefix, stage, stagesCount, onDelete } = props;

    const { t } = useTranslations();

    useFormField<Record<string, ICreateProcessFormStage>, typeof formPrefix>(formPrefix);

    const stageType = useWatch<Record<string, ICreateProcessFormStage['type']>>({ name: `${formPrefix}.type` });

    const processBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const stageBodies = processBodies.filter((body) => body.stageId === stage.internalId);

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const stageNameField = useFormField<ICreateProcessFormStage, 'name'>('name', {
        label: t('app.createDao.createProcessForm.governanceStage.name.label'),
        trimOnBlur: true,
        rules: { required: true, maxLength: nameMaxLength },
        fieldPrefix: formPrefix,
        defaultValue: '',
    });

    return (
        <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
            <InputText
                helpText={t('app.createDao.createProcessForm.governanceStage.name.helpText')}
                maxLength={nameMaxLength}
                {...stageNameField}
            />
            <GovernanceStageTypeField fieldPrefix={formPrefix} />
            <GovernanceStageTimingField fieldPrefix={`${formPrefix}.timing`} stageType={stageType} />
            {!isTimelockStage && (
                <GovernanceBodiesField
                    stageId={stage.internalId}
                    isOptimisticStage={isOptimisticStage}
                    allowMultipleBodies={true}
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
                            {t('app.createDao.createProcessForm.governanceStage.action.more')}
                        </Button>
                    }
                >
                    <Dropdown.Item onClick={onDelete}>
                        {t('app.createDao.createProcessForm.governanceStage.action.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </Card>
    );
};
