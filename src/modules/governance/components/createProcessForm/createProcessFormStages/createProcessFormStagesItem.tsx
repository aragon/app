import type { ICreateProcessFormStage } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/gov-ui-kit';
import type React from 'react';
import { useWatch } from 'react-hook-form';
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
     * Number of stages.
     */
    stagesCount: number;
    /**
     * Callback called to remove a stage from the array.
     */
    onRemoveStage: () => void;
}

export const CreateProcessFormStagesItem: React.FC<ICreateProcessFormStagesItemProps> = (props) => {
    const { index, name, stagesCount, onRemoveStage } = props;

    const { t } = useTranslations();

    const stageType = useWatch<Record<string, string>>({ name: `${name}.type` });
    const isOptimisticStage = stageType === 'optimistic';

    const stageNameField = useFormField<ICreateProcessFormStage, 'name'>('name', {
        label: t('app.governance.createProcessForm.stage.name.label'),
        trimOnBlur: true,
        rules: { required: true },
        fieldPrefix: name,
        defaultValue: '',
    });

    return (
        <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
            <InputText
                maxLength={40}
                helpText={t('app.governance.createProcessForm.stage.name.helpText')}
                placeholder={t('app.governance.createProcessForm.stage.name.placeholder')}
                {...stageNameField}
            />
            <StageTypeField fieldPrefix={name} />
            <StageTimingField stageFieldName={name} isOptimisticStage={isOptimisticStage} />
            <StageBodiesField index={index} isOptimisticStage={isOptimisticStage} stageFieldName={name} />
            {stagesCount > 1 && (
                <div className="flex self-end">
                    <Dropdown.Container
                        constrainContentWidth={false}
                        size="md"
                        customTrigger={
                            <Button className="w-fit" variant="tertiary" size="md" iconRight={IconType.DOTS_VERTICAL}>
                                {t('app.governance.createProcessForm.stage.bodies.more')}
                            </Button>
                        }
                    >
                        <Dropdown.Item onClick={onRemoveStage}>
                            {t('app.governance.createProcessForm.stage.bodies.remove')}
                        </Dropdown.Item>
                    </Dropdown.Container>
                </div>
            )}
        </Card>
    );
};
