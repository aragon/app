import { Accordion, Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useWatch } from 'react-hook-form';
import safeWallet from '@/assets/images/safeWallet.png';
import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { GovernanceBodyInfo } from '@/shared/components/governanceBodyInfo';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IPluginInfo } from '@/shared/types';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { BodyType } from '../../../../../types/enum';
import { GovernanceType, type ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { createProcessFormUtils } from '../../../createProcessFormUtils';
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

    const isNew = body.type === BodyType.NEW;
    const isExternal = body.type === BodyType.EXTERNAL;
    const isEditAllowed = onEdit != null;

    return (
        <Accordion.Container defaultValue={readOnly ? [body.internalId] : undefined} isMulti={true}>
            <Accordion.Item value={body.internalId}>
                <Accordion.ItemHeader>
                    <GovernanceBodyInfo
                        address={isNew ? undefined : body.address}
                        build={isNew ? plugin?.installVersion.build.toString() : isExternal ? undefined : body.build}
                        logoSrc={createProcessFormUtils.isBodySafe(body) ? safeWallet.src : undefined}
                        name={isExternal ? undefined : body.name}
                        release={isNew ? plugin?.installVersion.release.toString() : isExternal ? undefined : body.release}
                        subdomain={isNew ? plugin?.id : body.plugin}
                    />
                </Accordion.ItemHeader>
                <Accordion.ItemContent className="data-[state=open]:flex data-[state=open]:flex-col data-[state=open]:gap-y-4 data-[state=open]:md:gap-y-6">
                    <PluginSingleComponent
                        body={body}
                        daoId={daoId}
                        Fallback={GovernanceBodiesFieldItemDefault}
                        isAdvancedGovernance={isAdvancedGovernance}
                        pluginId={body.plugin}
                        slotId={CreateDaoSlotId.CREATE_DAO_PROCESS_BODY_READ_FIELD}
                    />
                    {!readOnly && (
                        <div className={classNames('flex w-full grow', isEditAllowed ? 'justify-between' : 'justify-end')}>
                            {isEditAllowed && (
                                <Button onClick={onEdit} size="md" variant="secondary">
                                    {t('app.createDao.createProcessForm.governance.bodyField.action.edit')}
                                </Button>
                            )}
                            <Dropdown.Container
                                constrainContentWidth={false}
                                customTrigger={
                                    <Button className="w-fit" iconRight={IconType.DOTS_VERTICAL} size="md" variant="tertiary">
                                        {t('app.createDao.createProcessForm.governance.bodyField.action.more')}
                                    </Button>
                                }
                                size="md"
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
