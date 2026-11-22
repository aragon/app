import {
    Accordion,
    InteractiveAncestorContext,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
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

export interface IPermissionsListRowProps {
    row: IDaoPermission;
    rowKey: string;
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    accounts: IPermissionAccountRef[];
    chainId?: number;
    daoId?: string;
    network?: Network;
}

type PermissionCardTab = 'details' | 'condition';

export const PermissionsListRow: React.FC<IPermissionsListRowProps> = (
    props,
) => {
    const { row, rowKey, daoPlugins, accounts, chainId, daoId, network } =
        props;
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
            <div className="flex flex-col gap-group rounded-xl border border-surface-secondary bg-surface-primary p-inset-surface-flat--fixed-16 md:hidden">
                <div className="flex items-start justify-between gap-related">
                    <p className="min-w-0 truncate font-mono text-lg leading-tight text-surface-primary">
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
                        daoId={daoId}
                        network={network}
                        row={row}
                    />
                )}
            </div>
            <Accordion.Item className="hidden md:block" value={rowKey}>
                <Accordion.ItemHeader>
                    <InteractiveAncestorContext.Provider value={true}>
                        <div className="grid w-full grid-cols-4 items-center gap-group text-left">
                            <div className="min-w-0">
                                <PermissionEntityCell entity={who} />
                            </div>
                            <div className="min-w-0">
                                <PermissionEntityCell entity={where} />
                            </div>
                            <span className="block min-w-0 truncate font-mono text-surface-primary">
                                {permissionName}
                            </span>
                            <span className="block min-w-0 truncate text-surface-primary">
                                {conditionLabel}
                            </span>
                        </div>
                    </InteractiveAncestorContext.Provider>
                </Accordion.ItemHeader>
                <Accordion.ItemContent>
                    <div className="flex flex-col gap-section--24-32 md:flex-row">
                        <div className="flex flex-1 flex-col gap-related">
                            <p className="text-lg leading-tight text-surface-primary">
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
                        <div className="flex flex-1 flex-col gap-related">
                            {hasConditionBreakdown && (
                                <>
                                    <p className="text-lg leading-tight text-surface-primary">
                                        {t(
                                            'app.settings.permissionsList.condition.heading',
                                        )}
                                    </p>
                                    <PermissionCondition
                                        chainId={chainId}
                                        daoId={daoId}
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
