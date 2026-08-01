import { Accordion, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
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
import { PermissionDetailsList } from './permissionDetailsList';
import { PermissionEntityCell } from './permissionEntityCell';
import { PermissionSummaryField } from './permissionSummaryField';

export interface IPermissionsListRowProps {
    row: IDaoPermission;
    rowKey: string;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accounts: IPermissionAccountRef[];
    chainId?: number;
    network?: Network;
}

type PermissionCardTab = 'details' | 'condition';

export const PermissionsListRow: React.FC<IPermissionsListRowProps> = (
    props,
) => {
    const { row, rowKey, daoPlugins, accounts, chainId, network } = props;
    const { t } = useTranslations();
    const [activeTab, setActiveTab] = useState<PermissionCardTab>('details');
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
        label: conditionLabel,
        hasCondition,
        isUnrecognized,
    } = conditionTypeUtils.resolveConditionDisplay(row);
    const hasConditionBreakdown = hasCondition && !isUnrecognized;

    const handleTabChange = (value?: string | string[]) => {
        if (value === 'details' || value === 'condition') {
            setActiveTab(value);
        }
    };

    const selectedTab = hasConditionBreakdown ? activeTab : 'details';

    return (
        <>
            <div className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:hidden">
                <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-mono text-lg text-neutral-800 leading-tight">
                        {permissionName}
                    </p>
                    {hasConditionBreakdown && (
                        <ToggleGroup
                            isMultiSelect={false}
                            onChange={handleTabChange}
                            value={selectedTab}
                        >
                            <Toggle
                                label={t(
                                    'app.settings.permissionsList.details.heading',
                                )}
                                value="details"
                            />
                            <Toggle
                                label={t(
                                    'app.settings.permissionsList.condition.heading',
                                )}
                                value="condition"
                            />
                        </ToggleGroup>
                    )}
                </div>
                {selectedTab === 'details' ? (
                    <PermissionDetailsList
                        chainId={chainId}
                        row={row}
                        where={where}
                        who={who}
                    />
                ) : (
                    <PermissionCondition
                        chainId={chainId}
                        network={network}
                        row={row}
                    />
                )}
            </div>
            <Accordion.Item className="hidden md:block" value={rowKey}>
                <Accordion.ItemHeader>
                    <div className="grid w-full grid-cols-1 items-start gap-4 text-left sm:grid-cols-2 md:grid-cols-4 md:items-center">
                        <PermissionSummaryField
                            label={t('app.settings.permissionsList.header.who')}
                        >
                            <PermissionEntityCell entity={who} />
                        </PermissionSummaryField>
                        <PermissionSummaryField
                            label={t(
                                'app.settings.permissionsList.header.where',
                            )}
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
                                {t(
                                    'app.settings.permissionsList.details.heading',
                                )}
                            </p>
                            <PermissionDetailsList
                                chainId={chainId}
                                row={row}
                                where={where}
                                who={who}
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                            {hasConditionBreakdown && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                </Accordion.ItemContent>
            </Accordion.Item>
        </>
    );
};
