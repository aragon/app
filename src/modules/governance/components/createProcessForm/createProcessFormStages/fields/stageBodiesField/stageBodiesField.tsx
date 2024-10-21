import { useTranslations } from '@/shared/components/translationsProvider';
import {
    Accordion,
    Button,
    Card,
    DefinitionList,
    Dropdown,
    formatterUtils,
    Heading,
    IconType,
    InputContainer,
    NumberFormat,
    Tag,
} from '@aragon/ods';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type {
    ICreateProcessFormBody,
    ICreateProcessFormData,
    IMultisigVotingMember,
    IOpenDialogState,
    ITokenVotingMember,
} from '../../../createProcessFormDefinitions';
import { StageRequiredApprovalsField } from '../stageRequiredApprovalsField';
import { StageBodiesFieldDialog } from './stageBodiesFieldDialog';

export interface IStageBodiesFieldProps {
    /**
     * Field name of the current stage.
     */
    stageFieldName: string;
    /**
     * Defines if current stage is optimistic or not.
     */
    isOptimisticStage: boolean;
    /**
     * Index of the current stage.
     */
    index: number;
}

export const StageBodiesField: React.FC<IStageBodiesFieldProps> = (props) => {
    const { stageFieldName, isOptimisticStage, index } = props;

    const [isBodyDialogOpen, setIsBodyDialogOpen] = useState<IOpenDialogState>({ dialogOpen: false, editBodyIndex: 0 });

    const handleAddBody = () => {
        appendBody({
            bodyNameField: '',
            bodyGovernanceTypeField: 'tokenVoting',
            bodyResourceField: [],
            tokenNameField: '',
            tokenSymbolField: '',
            supportThresholdField: 50,
            minimumParticipationField: 0,
            voteChangeField: false,
            resourcesField: [],
            members: [],
            multisigThresholdField: 1,
        });
        setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: controlledBodyField.length, newBody: true });
    };

    const handleEditBody = (bodyIndex: number) => setIsBodyDialogOpen({ dialogOpen: true, editBodyIndex: bodyIndex });

    const { t } = useTranslations();
    const { watch, formState } = useFormContext<ICreateProcessFormData>();

    const bodyFieldName = `${stageFieldName}.bodies`;
    const {
        fields: bodyField,
        remove: removeBody,
        update: updateBody,
        append: appendBody,
    } = useFieldArray<Record<string, ICreateProcessFormBody[]>>({ name: bodyFieldName });
    const watchBodyField = watch(bodyFieldName as `stages.${number}.bodies`);

    const controlledBodyField = bodyField.map((field, index) => ({ ...field, ...watchBodyField[index] }));

    const bodiesErrorMessage = formState.errors.stages?.[index]?.bodies?.message;
    const bodyFieldAlert =
        bodiesErrorMessage != null ? { message: bodiesErrorMessage, variant: 'critical' as const } : undefined;

    return (
        <>
            <InputContainer
                className="flex flex-col gap-2"
                id={bodyFieldName}
                label={
                    isOptimisticStage
                        ? t('app.governance.createProcessForm.stage.bodies.label.vetoing')
                        : t('app.governance.createProcessForm.stage.bodies.label.voting')
                }
                helpText={t('app.governance.createProcessForm.stage.bodies.helpText')}
                useCustomWrapper={true}
                alert={bodyFieldAlert}
            >
                <div className="flex flex-col gap-3 md:gap-2">
                    {controlledBodyField.map((field, index) => (
                        <Card key={field.id} className="overflow-hidden border border-neutral-100">
                            <Accordion.Container isMulti={true}>
                                <Accordion.Item value={field.id}>
                                    <Accordion.ItemHeader>
                                        <Heading size="h4">{field.bodyNameField}</Heading>
                                    </Accordion.ItemHeader>
                                    <Accordion.ItemContent>
                                        <DefinitionList.Container className="w-full">
                                            {field.bodyGovernanceTypeField === 'tokenVoting' && (
                                                <>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.token',
                                                        )}
                                                    >
                                                        {field.tokenNameField} (${field.tokenSymbolField})
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.distribution',
                                                        )}
                                                    >
                                                        {field.members.length}{' '}
                                                        {(field.members.length ?? 0) > 1
                                                            ? t(
                                                                  'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.plural',
                                                              )
                                                            : t(
                                                                  'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.single',
                                                              )}
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.supply',
                                                        )}
                                                    >
                                                        {formatterUtils.formatNumber(
                                                            field.members.reduce(
                                                                (
                                                                    sum: number,
                                                                    member: ITokenVotingMember | IMultisigVotingMember,
                                                                ) =>
                                                                    sum +
                                                                    Number((member as ITokenVotingMember).tokenAmount),
                                                                0,
                                                            ),
                                                            { format: NumberFormat.TOKEN_AMOUNT_LONG },
                                                        )}{' '}
                                                        ${field.tokenSymbolField}
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.support',
                                                        )}
                                                    >
                                                        {`> ${field.supportThresholdField}%`}
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.minimum',
                                                        )}
                                                    >
                                                        {`≥ ${field.minimumParticipationField}%`}
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.tokenVoting.voteChange',
                                                        )}
                                                    >
                                                        <Tag
                                                            label={
                                                                field.voteChangeField
                                                                    ? t(
                                                                          'app.governance.createProcessForm.stage.bodies.summary.no',
                                                                      )
                                                                    : t(
                                                                          'app.governance.createProcessForm.stage.bodies.summary.no',
                                                                      )
                                                            }
                                                            variant={field.voteChangeField ? 'primary' : 'neutral'}
                                                            className="max-w-fit"
                                                        />
                                                    </DefinitionList.Item>
                                                </>
                                            )}

                                            {field.bodyGovernanceTypeField === 'multisig' && (
                                                <>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.multisig.members',
                                                        )}
                                                    >
                                                        {field.members.length}{' '}
                                                        {(field.members.length ?? 0) > 1
                                                            ? t(
                                                                  'app.governance.createProcessForm.stage.bodies.summary.multisig.plural',
                                                              )
                                                            : t(
                                                                  'app.governance.createProcessForm.stage.bodies.summary.multisig.single',
                                                              )}
                                                    </DefinitionList.Item>
                                                    <DefinitionList.Item
                                                        term={t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.multisig.threshold',
                                                        )}
                                                    >
                                                        {field.multisigThresholdField} of {field.members.length}
                                                    </DefinitionList.Item>
                                                </>
                                            )}
                                        </DefinitionList.Container>
                                        <div className="flex w-full grow justify-between">
                                            <Button
                                                className="justify-end"
                                                variant="secondary"
                                                size="md"
                                                onClick={() => handleEditBody(index)}
                                            >
                                                {t('app.governance.createProcessForm.stage.bodies.summary.edit')}
                                            </Button>
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
                                                        {t(
                                                            'app.governance.createProcessForm.stage.bodies.summary.more',
                                                        )}
                                                    </Button>
                                                }
                                            >
                                                <Dropdown.Item onClick={() => removeBody(index)}>
                                                    Remove body
                                                </Dropdown.Item>
                                            </Dropdown.Container>
                                        </div>
                                    </Accordion.ItemContent>
                                </Accordion.Item>
                            </Accordion.Container>
                        </Card>
                    ))}
                    <Button
                        size="md"
                        variant="tertiary"
                        className="w-fit"
                        iconLeft={IconType.PLUS}
                        onClick={handleAddBody}
                    >
                        {t('app.governance.createProcessForm.stage.bodies.add')}
                    </Button>
                    {isBodyDialogOpen.dialogOpen && (
                        <StageBodiesFieldDialog
                            removeBody={removeBody}
                            updateBody={updateBody}
                            isBodyDialogOpen={isBodyDialogOpen}
                            setIsBodyDialogOpen={setIsBodyDialogOpen}
                            stageFieldName={stageFieldName}
                        />
                    )}
                </div>
            </InputContainer>
            {controlledBodyField.length > 0 && (
                <StageRequiredApprovalsField
                    fieldPrefix={stageFieldName}
                    stageBodiesCount={controlledBodyField.length}
                    isOptimisticStage={isOptimisticStage}
                />
            )}
        </>
    );
};
