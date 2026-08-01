'use client';

import { Accordion, CardEmptyState } from '@aragon/gov-ui-kit';
import type { IDaoPermission, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import type { IPermissionAccountRef } from '../../utils/permissionEntityUtils';
import { permissionEntityUtils } from '../../utils/permissionEntityUtils';
import { PermissionsListHeader } from './permissionsListHeader';
import { PermissionsListRow } from './permissionsListRow';
import { PermissionsListSkeleton } from './permissionsListSkeleton';

export interface IPermissionsListProps {
    rows: IDaoPermission[];
    accountRefs: IPermissionAccountRef[];
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    chainId?: number;
    isLoading: boolean;
    expandedRows: string[];
    onExpandedRowsChange: (rows: string[]) => void;
}

export const getPermissionRowKey = (row: IDaoPermission): string => {
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;

    return `${row.permissionId}-${row.whoAddress.toLowerCase()}-${row.whereAddress.toLowerCase()}-${conditionAddress.toLowerCase()}`;
};

export const PermissionsList: React.FC<IPermissionsListProps> = (props) => {
    const {
        rows,
        accountRefs,
        daoPlugins,
        chainId,
        isLoading,
        expandedRows,
        onExpandedRowsChange,
    } = props;
    const { t } = useTranslations();

    if (isLoading) {
        return <PermissionsListSkeleton />;
    }

    if (rows.length === 0) {
        return (
            <CardEmptyState
                description={t(
                    'app.settings.permissionsList.empty.description',
                )}
                heading={t('app.settings.permissionsList.empty.heading')}
                objectIllustration={{ object: 'SETTINGS' }}
            />
        );
    }

    const sortedRows = rows
        .map((row) => ({
            row,
            whereLabel: permissionEntityUtils.resolvePermissionEntity(
                row.whereAddress,
                { daoPlugins, accounts: accountRefs, entity: row.where },
            ).label,
        }))
        .sort((first, second) =>
            first.whereLabel.localeCompare(second.whereLabel, undefined, {
                sensitivity: 'base',
            }),
        )
        .map((entry) => entry.row);

    return (
        <div className="flex flex-col gap-3">
            <PermissionsListHeader />
            <Accordion.Container
                isMulti={true}
                onValueChange={(value: string[] | undefined) =>
                    onExpandedRowsChange(value ?? [])
                }
                value={expandedRows}
            >
                {sortedRows.map((row) => (
                    <PermissionsListRow
                        accounts={accountRefs}
                        chainId={chainId}
                        daoPlugins={daoPlugins}
                        key={getPermissionRowKey(row)}
                        network={row.network}
                        row={row}
                        rowKey={getPermissionRowKey(row)}
                    />
                ))}
            </Accordion.Container>
        </div>
    );
};
