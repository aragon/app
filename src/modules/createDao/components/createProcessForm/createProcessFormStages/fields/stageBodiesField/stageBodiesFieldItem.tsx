import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogDefinitions';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Accordion, Button, Card, Dropdown, Heading, IconType } from '@aragon/gov-ui-kit';

export interface IStageBodiesFieldItemProps {
    /**
     * Name of the body field.
     */
    fieldName: string;
    /**
     * Body to display the details for.
     */
    body: ISetupBodyForm;
    /**
     * Callback called on edit button click.
     */
    onEdit: () => void;
    /**
     * Callback called on delete button click.
     */
    onDelete: () => void;
}

export const StageBodiesFieldItem: React.FC<IStageBodiesFieldItemProps> = (props) => {
    const { fieldName, body, onEdit, onDelete } = props;

    const { t } = useTranslations();
    useFormField<Record<string, ISetupBodyForm>, typeof fieldName>(fieldName);

    return (
        <Card className="overflow-hidden border border-neutral-100">
            <Accordion.Container isMulti={true}>
                <Accordion.Item value={body.internalId}>
                    <Accordion.ItemHeader>
                        <Heading size="h4">{body.name}</Heading>
                    </Accordion.ItemHeader>
                    <Accordion.ItemContent>
                        <PluginSingleComponent
                            pluginId={body.plugin}
                            slotId={CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD}
                            body={body}
                        />
                        <div className="flex w-full grow justify-between">
                            <Button className="justify-end" variant="secondary" size="md" onClick={onEdit}>
                                {t('app.createDao.createProcessForm.stages.bodies.action.edit')}
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
                                        {t('app.createDao.createProcessForm.stages.bodies.action.more')}
                                    </Button>
                                }
                            >
                                <Dropdown.Item onClick={onDelete}>
                                    {t('app.createDao.createProcessForm.stages.bodies.action.remove')}
                                </Dropdown.Item>
                            </Dropdown.Container>
                        </div>
                    </Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Container>
        </Card>
    );
};
