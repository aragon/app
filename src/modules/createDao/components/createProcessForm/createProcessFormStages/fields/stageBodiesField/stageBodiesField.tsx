import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Accordion, Button, Card, Dropdown, Heading, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useAccount } from 'wagmi';
import type { ICreateProcessFormBody, ICreateProcessFormData } from '../../../createProcessFormDefinitions';
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

interface IBodyDialogState {
    /**
     * Dialog open state.
     */
    isOpen: boolean;
    /**
     * Index of the body to edit.
     */
    bodyIndex: number;
    /**
     * Displays the select governance type view when creating a new body.
     */
    isNewBody?: boolean;
}

let bodyId = 0;

export const StageBodiesField: React.FC<IStageBodiesFieldProps> = (props) => {
    const { stageFieldName, isOptimisticStage, index } = props;

    const [bodyDialogState, setBodyDialogState] = useState<IBodyDialogState>({ isOpen: false, bodyIndex: 0 });

    const { address } = useAccount();

    const handleAddBody = () => {
        appendBody({
            name: '',
            id: (bodyId++).toString(),
            governanceType: 'token-voting',
            tokenType: 'new',
            resources: [],
            members: [{ address: address ?? '', tokenAmount: 1 }],
            tokenName: '',
            tokenSymbol: '',
            supportThreshold: 50,
            minParticipation: 0,
            votingMode: DaoTokenVotingMode.STANDARD,
            multisigThreshold: 1,
        });
        setBodyDialogState({ isOpen: true, bodyIndex: controlledBodyField.length, isNewBody: true });
    };

    const handleEditBody = (bodyIndex: number) => setBodyDialogState({ isOpen: true, bodyIndex: bodyIndex });

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
                        ? t('app.createDao.createProcessForm.stages.bodies.label.vetoing')
                        : t('app.createDao.createProcessForm.stages.bodies.label.voting')
                }
                helpText={t('app.createDao.createProcessForm.stages.bodies.helpText')}
                useCustomWrapper={true}
                alert={bodyFieldAlert}
            >
                <div className="flex flex-col gap-3 md:gap-2">
                    {controlledBodyField.map((field, index) => (
                        <Card key={field.id} className="overflow-hidden border border-neutral-100">
                            <Accordion.Container isMulti={true}>
                                <Accordion.Item value={field.id}>
                                    <Accordion.ItemHeader>
                                        <Heading size="h4">{field.name}</Heading>
                                    </Accordion.ItemHeader>
                                    <Accordion.ItemContent>
                                        <PluginSingleComponent
                                            pluginId={field.governanceType}
                                            slotId={CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD}
                                            field={field}
                                        />
                                        <div className="flex w-full grow justify-between">
                                            <Button
                                                className="justify-end"
                                                variant="secondary"
                                                size="md"
                                                onClick={() => handleEditBody(index)}
                                            >
                                                {t('app.createDao.createProcessForm.stages.bodies.summary.edit')}
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
                                                            'app.createDao.createProcessForm.stages.bodies.summary.more',
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
                        {t('app.createDao.createProcessForm.stages.bodies.add')}
                    </Button>
                    {bodyDialogState.isOpen && (
                        <StageBodiesFieldDialog
                            stageFieldName={stageFieldName}
                            removeBody={removeBody}
                            updateBody={updateBody}
                            onClose={() => setBodyDialogState({ isOpen: false, bodyIndex: 0 })}
                            {...bodyDialogState}
                        />
                    )}
                </div>
            </InputContainer>
        </>
    );
};
