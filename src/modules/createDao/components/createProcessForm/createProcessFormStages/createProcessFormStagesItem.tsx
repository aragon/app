import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Card, InputText } from '@aragon/gov-ui-kit';
import type React from 'react';
import type { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { ProcessStageType, type ICreateProcessFormStage } from '../createProcessFormDefinitions';
import { StageBodiesField } from './fields/stageBodiesField';
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
     * Children of the component.
     */
    children?: ReactNode;
}

const nameMaxLength = 40;

export const CreateProcessFormStagesItem: React.FC<ICreateProcessFormStagesItemProps> = (props) => {
    const { index, name, children } = props;

    const { t } = useTranslations();

    const stageType = useWatch<Record<string, ICreateProcessFormStage['type']>>({ name: `${name}.type` });

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
                placeholder={t('app.createDao.createProcessForm.stages.name.placeholder')}
                maxLength={nameMaxLength}
                {...stageNameField}
            />
            <StageTypeField fieldPrefix={name} />
            <StageTimingField stageFieldName={name} stageType={stageType} />
            {!isTimelockStage && (
                <StageBodiesField index={index} isOptimisticStage={isOptimisticStage} stageFieldName={name} />
            )}
            {children}
        </Card>
    );
};
