import { CreateProcessFormBodyDialog } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialog';
import { CreateProcessFormBodySummary } from '@/modules/governance/components/createProcessForm/createProcessFormBodySummary';
import type { IOpenDialogState } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { type ICreateProcessFormStageFieldsProps } from '@/modules/governance/components/createProcessForm/createProcessFormStageFields';
import { CreateProcessFormTimingDialog } from '@/modules/governance/components/createProcessForm/createProcessFormTimingDialog';
import { CreateProcessFormTimingSummary } from '@/modules/governance/components/createProcessForm/createProcessFormTimingSummary';
import { useBodiesFieldArray } from '@/modules/governance/components/createProcessForm/hooks/useBodyFieldArray';
import { useStageFields } from '@/modules/governance/components/createProcessForm/hooks/useStagesFields';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    Button,
    Card,
    Dropdown,
    IconType,
    InputContainer,
    InputNumber,
    InputText,
    Progress,
    RadioCard,
    RadioGroup,
} from '@aragon/ods';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const CreateProcessFormStageFields: React.FC<ICreateProcessFormStageFieldsProps> = (props) => {
    const { stagesFieldArray, stageName, stageIndex, stageRemove } = props;
    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);
    const [isBodyDialogOpen, setIsBodyDialogOpen] = useState<IOpenDialogState>({
        dialogOpen: false,
        editBodyIndex: undefined,
    });

    const {
        setError,
        clearErrors,
        formState: { errors, isSubmitted },
    } = useFormContext();

    console.log('errors', errors);
    console.log('isSubmitted', isSubmitted);

    const { t } = useTranslations();

    const stageFields = useStageFields(stageName, stageIndex);

    const { stageNameField, stageTypeField, bodyThresholdField } = stageFields;

    const { bodiesFieldArray, removeBody, updateBody } = useBodiesFieldArray(stageName, stageIndex);
    const handleAddBody = () => {
        setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: undefined });
    };

    const handleEditBody = (index: number) => {
        setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: index });
    };

    useEffect(() => {
        if (isSubmitted && bodiesFieldArray.length < 1 && stageNameField.value !== '') {
            setError(`stages.${stageIndex}.bodies`, {
                type: 'minLength',
                message: 'You must create at least one body per stage.',
            });
        } else {
            clearErrors(`stages.${stageIndex}.bodies`);
        }
    }, [bodiesFieldArray.length, setError, clearErrors, stageIndex, isSubmitted, stageNameField.value]);

    return (
        <>
            <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
                <InputText
                    maxLength={40}
                    helpText={t('app.governance.createProcessForm.stage.name.helpText')}
                    placeholder={t('app.governance.createProcessForm.stage.name.placeholder')}
                    {...stageNameField}
                />
                <RadioGroup
                    className="flex flex-col gap-x-4 md:!flex-row"
                    onValueChange={stageTypeField.onChange}
                    helpText={t('app.governance.createProcessForm.stage.type.helpText')}
                    {...stageTypeField}
                >
                    <RadioCard
                        className="w-full"
                        label={t('app.governance.createProcessForm.stage.type.normal')}
                        description=""
                        value="normal"
                    />
                    <RadioCard
                        className="w-full"
                        label={t('app.governance.createProcessForm.stage.type.optimistic')}
                        description=""
                        value="optimistic"
                    />
                </RadioGroup>

                <InputContainer
                    id={`timingSummary.${stageName}.${stageIndex}`}
                    useCustomWrapper={true}
                    label={t('app.governance.createProcessForm.stage.timing.label')}
                    className="flex w-full flex-col items-start gap-y-3"
                    helpText={t('app.governance.createProcessForm.stage.timing.helpText')}
                >
                    <CreateProcessFormTimingSummary
                        stageName={stageName}
                        stageIndex={stageIndex}
                        onEditTimingClick={() => setIsTimingDialogOpen(true)}
                    />
                </InputContainer>

                <InputContainer
                    className="flex flex-col gap-2"
                    id="resourcesInput"
                    label={
                        stageTypeField.value === 'optimistic'
                            ? t('app.governance.createProcessForm.stage.bodies.label.vetoing')
                            : t('app.governance.createProcessForm.stage.bodies.label.voting')
                    }
                    helpText={t('app.governance.createProcessForm.stage.bodies.helpText')}
                    useCustomWrapper={true}
                    alert={
                        Array.isArray(errors.stages) && errors.stages[stageIndex]?.bodies
                            ? { message: (errors.stages[stageIndex] as any).bodies.message, variant: 'critical' }
                            : undefined
                    }
                >
                    {bodiesFieldArray?.length > 0 && (
                        <CreateProcessFormBodySummary
                            bodyFieldsArray={bodiesFieldArray}
                            setIsBodyDialogOpen={() =>
                                setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: undefined })
                            }
                            removeBody={removeBody}
                            stageName={stageName}
                            stageIndex={stageIndex}
                            onEditBody={handleEditBody}
                        />
                    )}
                    <Button
                        size="md"
                        variant="tertiary"
                        className="w-fit"
                        iconLeft={IconType.PLUS}
                        onClick={handleAddBody}
                    >
                        {t('app.governance.createProcessForm.stage.bodies.add')}
                    </Button>
                </InputContainer>

                {stagesFieldArray.length > 1 && (
                    <div className="flex self-end">
                        <Dropdown.Container
                            constrainContentWidth={false}
                            size="md"
                            customTrigger={
                                <Button
                                    className="w-fit"
                                    variant="tertiary"
                                    size="md"
                                    iconRight={IconType.DOTS_VERTICAL}
                                >
                                    {t('app.governance.createProcessForm.stage.bodies.more')}
                                </Button>
                            }
                        >
                            <Dropdown.Item onClick={() => stageRemove(stageIndex)}>
                                {t('app.governance.createProcessForm.stage.bodies.remove')}
                            </Dropdown.Item>
                        </Dropdown.Container>
                    </div>
                )}
                {bodiesFieldArray?.length > 0 && (
                    <InputContainer
                        id="bodyThreshold"
                        label={
                            stageTypeField.value === 'optimistic'
                                ? t('app.governance.createProcessForm.stage.bodies.threshold.label.vetoing')
                                : t('app.governance.createProcessForm.stage.bodies.threshold.label.voting')
                        }
                        useCustomWrapper={true}
                        helpText={
                            stageTypeField.value === 'optimistic'
                                ? t('app.governance.createProcessForm.stage.bodies.threshold.helpText.vetoing')
                                : t('app.governance.createProcessForm.stage.bodies.threshold.helpText.voting')
                        }
                    >
                        <div className="flex w-full items-center gap-x-4 rounded-xl border border-neutral-100 p-6">
                            <InputNumber min={0} max={bodiesFieldArray.length} {...bodyThresholdField} />
                            <div className="my-auto flex size-full flex-col justify-center gap-y-2">
                                <Progress value={(bodyThresholdField.value / bodiesFieldArray.length) * 100} />
                                <p className="text-right">
                                    {bodyThresholdField.value} of {bodiesFieldArray.length}{' '}
                                    {t('app.governance.createProcessForm.stage.bodies.threshold.bodies')}
                                </p>
                            </div>
                        </div>
                    </InputContainer>
                )}
            </Card>
            <CreateProcessFormTimingDialog
                stageName={stageName}
                stageIndex={stageIndex}
                isTimingDialogOpen={isTimingDialogOpen}
                setIsTimingDialogOpen={setIsTimingDialogOpen}
            />
            {isBodyDialogOpen.dialogOpen && (
                <CreateProcessFormBodyDialog
                    removeBody={removeBody}
                    updateBody={updateBody}
                    isBodyDialogOpen={isBodyDialogOpen}
                    setIsBodyDialogOpen={setIsBodyDialogOpen}
                    stageName={stageName}
                    stageIndex={stageIndex}
                />
            )}
        </>
    );
};
