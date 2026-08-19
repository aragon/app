'use client';

import { addressUtils, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IDao, IDaoPermission } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import { PermissionCondition } from '../permissionCondition';
import { PermissionDetailsList } from '../permissionsList/permissionDetailsList';
import type { IPermissionDetailsEntity } from '../permissionsList/permissionEntityListItem';

interface IPermissionDetailEntity {
    address: string;
    label?: string;
}

export interface IPermissionDetailContentProps {
    chainId?: number;
    className?: string;
    daoId?: string;
    network?: IDao['network'];
    row: IDaoPermission;
    who?: IPermissionDetailEntity;
    where?: IPermissionDetailEntity;
}

type PermissionDetailsTab = 'permission' | 'condition';

const isSentinelAddress = (address: string): boolean =>
    addressUtils.isAddressEqual(address.toLowerCase(), ANY_ADDR) ||
    addressUtils.isAddressEqual(address.toLowerCase(), ALLOW_FLAG);

const toDetailsEntity = (
    address: string,
    detail?: IPermissionDetailEntity,
): IPermissionDetailsEntity => ({
    address,
    label: detail?.label ?? addressUtils.truncateAddress(address),
    isSentinel: isSentinelAddress(address),
    detailName: detail?.label,
});

export const PermissionDetailContent: React.FC<
    IPermissionDetailContentProps
> = ({ chainId, className, daoId, network, row, who, where }) => {
    const { t } = useTranslations();
    const [activeTab, setActiveTab] =
        useState<PermissionDetailsTab>('permission');
    const { hasCondition, isUnrecognized } =
        conditionTypeUtils.resolveConditionDisplay(row);
    const hasConditionBreakdown = hasCondition && !isUnrecognized;

    const handleTabChange = (value?: string | string[]) => {
        if (value === 'permission' || value === 'condition') {
            setActiveTab(value);
        }
    };

    const selectedTab = hasConditionBreakdown ? activeTab : 'permission';

    return (
        <div className={className ?? 'flex flex-col gap-4 p-4'}>
            <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-neutral-800">
                    {t('app.settings.permissionsList.details.heading')}
                </p>
                {hasConditionBreakdown && (
                    <ToggleGroup
                        isMultiSelect={false}
                        onChange={handleTabChange}
                        value={selectedTab}
                    >
                        <Toggle
                            label={t(
                                'app.settings.permissionsList.details.permission',
                            )}
                            value="permission"
                        />
                        <Toggle
                            label={t(
                                'app.settings.permissionsList.details.condition',
                            )}
                            value="condition"
                        />
                    </ToggleGroup>
                )}
            </div>
            {selectedTab === 'permission' ? (
                <PermissionDetailsList
                    chainId={chainId}
                    row={row}
                    where={toDetailsEntity(row.whereAddress, where)}
                    who={toDetailsEntity(row.whoAddress, who)}
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
    );
};
