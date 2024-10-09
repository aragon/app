import { CreateProcessFormStageFields } from '@/modules/governance/components/createProcessForm/createProcessFormStageFields';
import { useStagesFieldArray } from '@/modules/governance/components/createProcessForm/hooks/useStageFieldArray';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/ods';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const stageName = 'stages';

    const { t } = useTranslations();

    const { stagesFieldArray, appendStage, removeStage } = useStagesFieldArray(stageName);

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2 md:gap-3">
                {stagesFieldArray.length > 0 && (
                    <div className="flex flex-col gap-3 md:gap-2">
                        {stagesFieldArray.map((field, index) => (
                            <CreateProcessFormStageFields
                                key={field.id}
                                stagesFieldArray={stagesFieldArray}
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
                    onClick={() => appendStage({})}
                >
                    {t('app.governance.createProcessForm.stage.add')}
                </Button>
            </div>
        </div>
    );
};
