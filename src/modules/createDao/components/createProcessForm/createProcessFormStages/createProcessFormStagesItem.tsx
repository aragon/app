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
import { StageBodiesField } from './fields/stageBodiesField';
import { StageRequiredApprovalsField } from './fields/stageRequiredApprovalsField';
import { StageTimingField } from './fields/stageTimingField';
import { StageTypeField } from './fields/stageTypeField';

export interface ICreateProcessFormStagesItemProps {
    /**
     * Index of the stage.
     */
    index: number;
    /**
     * Stage field name.
     */
    name: string;
    /**
     * Current number of stages.
     */
    stagesCount: number;
    /**
     * Callback called on delete button click.
     */
    onDelete: (index: number) => void;
}

const nameMaxLength = 40;

export const CreateProcessFormStagesItem: React.FC<ICreateProcessFormStagesItemProps> = (props) => {
    const { index, name, stagesCount, onDelete } = props;

    const { t } = useTranslations();

    const stageType = useWatch<Record<string, ICreateProcessFormStage['type']>>({ name: `${name}.type` });

    const processBodies = useWatch<Record<string, ICreateProcessFormData['bodies']>>({ name: 'bodies' });
    const stageBodies = processBodies.filter((body) => body.stageIndex === index);

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const stageNameField = useFormField<ICreateProcessFormStage, 'name'>('name', {
        label: t('app.createDao.createProcessForm.stages.name.label'),
        trimOnBlur: true,
        rules: { required: true, maxLength: nameMaxLength },
        fieldPrefix: name,
        defaultValue: '',
    });

    return (
        <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
            <InputText
                helpText={t('app.createDao.createProcessForm.stages.name.helpText')}
                maxLength={nameMaxLength}
                {...stageNameField}
            />
            <StageTypeField fieldPrefix={name} />
            <StageTimingField fieldPrefix={`${name}.timing`} stageType={stageType} />
            {!isTimelockStage && <StageBodiesField stageIndex={index} isOptimisticStage={isOptimisticStage} />}
            {stageBodies.length > 0 && (
                <StageRequiredApprovalsField
                    fieldPrefix={name}
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
                    <Dropdown.Item onClick={() => onDelete(index)}>
                        {t('app.createDao.createProcessForm.stages.action.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </Card>
    );
};
