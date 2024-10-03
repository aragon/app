import { CreateProcessFormStageFields } from '@/modules/governance/components/createProcessForm/createProcessFormStageFields';
import { Button, IconType } from '@aragon/ods';
import { useFieldArray } from 'react-hook-form';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const stageName = 'stages';

    const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({ name: stageName });
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2 md:gap-3">
                {stageFields.length > 0 && (
                    <div className="flex flex-col gap-3 md:gap-2">
                        {stageFields.map((field, index) => (
                            <CreateProcessFormStageFields
                                key={field.id}
                                stageFields={stageFields}
                                stageName={stageName}
                                stageIndex={index}
                                stageRemove={removeStage}
                            />
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
        </div>
    );
};
