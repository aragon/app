import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { SetupBodyType, type ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { GovernanceBodyInfo } from '@/shared/components/governanceBodyInfo';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Accordion, Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { GovernanceType, type ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { GovernanceBodiesFieldItemDefault } from './governanceBodiesFieldItemDefault';

export interface IGovernanceBodyFieldProps {
    /**
     * Name of the body field.
     */
    fieldName: string;
    /**
     * ID of the DAO to setup the body for.
     */
    daoId?: string;
    /**
     * Body to display the details for.
     */
    body: ISetupBodyForm;
    /**
     * Callback called on edit button click.
     */
    onEdit?: () => void;
    /**
     * Callback called on delete button click.
     */
    onDelete?: () => void;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const GovernanceBodyField: React.FC<IGovernanceBodyFieldProps> = (props) => {
    const { fieldName, daoId, body, onEdit, onDelete, readOnly = false } = props;

    const { t } = useTranslations();

    useFormField<Record<string, ISetupBodyForm>, typeof fieldName>(fieldName);

    const governanceType = useWatch<ICreateProcessFormData, 'governanceType'>({ name: 'governanceType' });

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    const plugin = pluginRegistryUtils.getPlugin(body.plugin) as IPluginInfo | undefined;

    const isNew = body.type === SetupBodyType.NEW;
    const isExternal = body.type === SetupBodyType.EXTERNAL;

    return (
        <Accordion.Container isMulti={true} defaultValue={readOnly ? [body.internalId] : undefined}>
            <Accordion.Item value={body.internalId}>
                <Accordion.ItemHeader>
                    <GovernanceBodyInfo
                        subdomain={isNew ? plugin?.id : body.plugin}
                        name={isExternal ? undefined : body.name}
                        address={isNew ? undefined : body.address}
                        release={
                            isNew ? plugin?.installVersion.release.toString() : isExternal ? undefined : body.release
                        }
                        build={isNew ? plugin?.installVersion.build.toString() : isExternal ? undefined : body.build}
                    />
                </Accordion.ItemHeader>
                <Accordion.ItemContent className="data-[state=open]:flex data-[state=open]:flex-col data-[state=open]:gap-y-4 data-[state=open]:md:gap-y-6">
                    <PluginSingleComponent
                        pluginId={body.plugin}
                        slotId={CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD}
                        daoId={daoId}
                        readOnly={readOnly}
                        body={body}
                        isAdvancedGovernance={isAdvancedGovernance}
                        Fallback={GovernanceBodiesFieldItemDefault}
                    />
                    {!readOnly && (
                        <div className="flex w-full grow justify-between">
                            {onEdit != null && (
                                <Button variant="secondary" size="md" onClick={onEdit}>
                                    {t('app.createDao.createProcessForm.governance.bodyField.action.edit')}
                                </Button>
                            )}
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
                    )}
                </Accordion.ItemContent>
            </Accordion.Item>
        </Accordion.Container>
    );
};
