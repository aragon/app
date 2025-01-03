import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import {
    ProcessStageType,
    type ICreateProcessFormData,
    type ICreateProcessFormStage,
} from '../createProcessFormDefinitions';
import { CreateProcessFormStagesItem } from './createProcessFormStagesItem';

const defaultStage: ICreateProcessFormStage = {
    name: '',
    type: ProcessStageType.NORMAL,
    votingPeriod: { days: 7, minutes: 0, hours: 0 },
    earlyStageAdvance: false,
    requiredApprovals: 1,
    bodies: [],
};

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const { t } = useTranslations();

    const {
        fields: stages,
        append,
        remove,
    } = useFieldArray<Record<string, ICreateProcessFormData['stages']>>({
        name: 'stages',
    });

    const handleAddStage = () => append(defaultStage);

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex flex-col gap-3 md:gap-2">
                {stages.map((field, index) => (
                    <CreateProcessFormStagesItem key={field.id} index={index} name={`stages.${index.toString()}`}>
                        {stages.length > 1 && (
                            <Dropdown.Container
                                constrainContentWidth={false}
                                size="md"
                                customTrigger={
                                    <Button
                                        variant="tertiary"
                                        size="md"
                                        iconRight={IconType.DOTS_VERTICAL}
                                        className="self-end"
                                    >
                                        {t('app.createDao.createProcessForm.stages.more')}
                                    </Button>
                                }
                            >
                                <Dropdown.Item onClick={() => remove(index)}>
                                    {t('app.createDao.createProcessForm.stages.remove')}
                                </Dropdown.Item>
                            </Dropdown.Container>
                        )}
                    </CreateProcessFormStagesItem>
                ))}
            </div>
            <Button
                size="md"
                variant="tertiary"
                className="self-start"
                iconLeft={IconType.PLUS}
                onClick={handleAddStage}
            >
                {t('app.createDao.createProcessForm.stages.add')}
            </Button>
        </div>
    );
};
