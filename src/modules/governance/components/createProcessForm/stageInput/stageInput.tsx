import { Button, IconType } from '@aragon/ods';
import { useFieldArray } from 'react-hook-form';
import type { IStageInputProps, IStageInputResource } from './stageInput.api';
import { StageInputItem } from './stageInputItem';

export type StageInputBaseForm = Record<string, IStageInputResource[]>;

export const StageInput: React.FC<IStageInputProps> = (props) => {
    const { name } = props;

    const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({ name });

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            {stageFields.length > 0 && (
                <div className="flex flex-col gap-3 md:gap-2">
                    {stageFields.map((field, index) => (
                        <StageInputItem key={field.id} stageName={name} stageIndex={index} stageRemove={removeStage} />
                    ))}
                </div>
            )}
            <Button
                size="md"
                variant="tertiary"
                className="w-fit"
                iconLeft={IconType.PLUS}
                onClick={() => appendStage({ name: '', url: '' })}
            >
                Add a stage
            </Button>
        </div>
    );
};
