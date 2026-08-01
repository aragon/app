import { Accordion, addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import type {
    IDaoPermission,
    IDaoPlugin,
    Network,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import type { IPermissionAccountRef } from '../../utils/permissionEntityUtils';
import { permissionEntityUtils } from '../../utils/permissionEntityUtils';
import { PermissionCondition } from '../permissionCondition';
import { PermissionAddressListItem } from './permissionAddressListItem';
import { PermissionEntityCell } from './permissionEntityCell';
import { PermissionEntityListItem } from './permissionEntityListItem';
import { PermissionSummaryField } from './permissionSummaryField';

export interface IPermissionsListRowProps {
    row: IDaoPermission;
    rowKey: string;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accounts: IPermissionAccountRef[];
    chainId?: number;
    network?: Network;
}

export const PermissionsListRow: React.FC<IPermissionsListRowProps> = (
    props,
) => {
    const { row, rowKey, daoPlugins, accounts, chainId, network } = props;
    const { t } = useTranslations();
    const resolveOptions = { daoPlugins, accounts };
    const who = permissionEntityUtils.resolvePermissionEntity(row.whoAddress, {
        ...resolveOptions,
        entity: row.who,
    });
    const where = permissionEntityUtils.resolvePermissionEntity(
        row.whereAddress,
        {
            ...resolveOptions,
            entity: row.where,
        },
    );
    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );
    const {
        address: conditionAddress,
        label: conditionLabel,
        hasCondition,
    } = conditionTypeUtils.resolveConditionDisplay(row);

    return (
        <Accordion.Item value={rowKey}>
            <Accordion.ItemHeader>
                <div className="grid w-full grid-cols-1 items-start gap-4 text-left sm:grid-cols-2 md:grid-cols-4 md:items-center">
                    <PermissionSummaryField
                        label={t('app.settings.permissionsList.header.who')}
                    >
                        <PermissionEntityCell entity={who} />
                    </PermissionSummaryField>
                    <PermissionSummaryField
                        label={t('app.settings.permissionsList.header.where')}
                    >
                        <PermissionEntityCell entity={where} />
                    </PermissionSummaryField>
                    <PermissionSummaryField
                        label={t(
                            'app.settings.permissionsList.header.permission',
                        )}
                    >
                        <span className="block min-w-0 truncate font-mono text-neutral-800">
                            {permissionName}
                        </span>
                    </PermissionSummaryField>
                    <PermissionSummaryField
                        label={t(
                            'app.settings.permissionsList.header.condition',
                        )}
                    >
                        <span className="block min-w-0 truncate text-neutral-800">
                            {conditionLabel}
                        </span>
                    </PermissionSummaryField>
                </div>
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                    <div className="flex flex-1 flex-col gap-3">
                        <p className="text-lg text-neutral-800 leading-tight">
                            {t('app.settings.permissionsList.details.heading')}
                        </p>
                        <DefinitionList.Container>
                            <PermissionEntityListItem
                                chainId={chainId}
                                entity={who}
                                term={t(
                                    'app.settings.permissionsList.details.who',
                                )}
                            />
                            <PermissionEntityListItem
                                chainId={chainId}
                                entity={where}
                                term={t(
                                    'app.settings.permissionsList.details.where',
                                )}
                            />
                            <DefinitionList.Item
                                copyValue={row.permissionId}
                                description={permissionName}
                                term={t(
                                    'app.settings.permissionsList.details.permission',
                                )}
                            >
                                {addressUtils.truncateHash(row.permissionId)}
                            </DefinitionList.Item>
                            {hasCondition ? (
                                <PermissionAddressListItem
                                    address={conditionAddress}
                                    chainId={chainId}
                                    name={conditionLabel}
                                    term={t(
                                        'app.settings.permissionsList.details.condition',
                                    )}
                                />
                            ) : (
                                <DefinitionList.Item
                                    term={t(
                                        'app.settings.permissionsList.details.condition',
                                    )}
                                >
                                    {conditionLabel}
                                </DefinitionList.Item>
                            )}
                        </DefinitionList.Container>
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                        <p className="text-lg text-neutral-800 leading-tight">
                            {t(
                                'app.settings.permissionsList.condition.heading',
                            )}
                        </p>
                        <PermissionCondition
                            chainId={chainId}
                            network={network}
                            row={row}
                        />
                    </div>
                </div>
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};
