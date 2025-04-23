import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import {
    SetupBodyType,
    type ISetupBodyForm,
} from '@/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogDefinitions';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Accordion, addressUtils, Button, Dropdown, Heading, IconType } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { GovernanceType, type ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { GovernanceBodiesFieldItemDefault } from './governanceBodiesFieldItemDefault';

export interface IGovernanceBodyFieldProps {
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

export const GovernanceBodyField: React.FC<IGovernanceBodyFieldProps> = (props) => {
    const { fieldName, body, onEdit, onDelete } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    useFormField<Record<string, ISetupBodyForm>, typeof fieldName>(fieldName);

    const processName = useWatch<ICreateProcessFormData, 'name'>({ name: 'name' });
    const governanceType = useWatch<ICreateProcessFormData, 'governanceType'>({ name: 'governanceType' });
    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    // Keep body-name & process-name in sync when setting up a simple governance process. Other metadata (description,
    // process-key, resources) is processed right before pinning the metadata for the simple governance process.
    useEffect(() => {
        if (isAdvancedGovernance) {
            return;
        }

        setValue(`${fieldName}.name`, processName);
    }, [isAdvancedGovernance, fieldName, processName, setValue]);

    return (
        <Accordion.Container isMulti={true}>
            <Accordion.Item value={body.internalId}>
                <Accordion.ItemHeader className="flex flex-col">
                    <div className="flex w-full items-center justify-between">
                        <Heading size="h4">
                            {body.type === SetupBodyType.NEW ? body.name : addressUtils.truncateAddress(body.address)}
                        </Heading>
                        {body.type === SetupBodyType.EXTERNAL && (
                            <Heading size="h4" className="text-neutral-500">
                                {addressUtils.truncateAddress(body.address)}
                            </Heading>
                        )}
                    </div>
                    {body.type === SetupBodyType.EXTERNAL && <p className="text-neutral-500">External address</p>}
                </Accordion.ItemHeader>
                <Accordion.ItemContent className="data-[state=open]:flex data-[state=open]:flex-col data-[state=open]:gap-y-4 data-[state=open]:md:gap-y-6">
                    <PluginSingleComponent
                        pluginId={body.plugin}
                        slotId={CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD}
                        body={body}
                        isAdvancedGovernance={isAdvancedGovernance}
                        Fallback={GovernanceBodiesFieldItemDefault}
                    />
                    <div className="flex w-full grow justify-between">
                        <Button className="justify-end" variant="secondary" size="md" onClick={onEdit}>
                            {t('app.createDao.createProcessForm.governance.bodyField.action.edit')}
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
                                    {t('app.createDao.createProcessForm.governance.bodyField.action.more')}
                                </Button>
                            }
                        >
                            <Dropdown.Item onClick={onDelete}>
                                {t('app.createDao.createProcessForm.governance.bodyField.action.remove')}
                            </Dropdown.Item>
                        </Dropdown.Container>
                    </div>
                </Accordion.ItemContent>
            </Accordion.Item>
        </Accordion.Container>
    );
};
