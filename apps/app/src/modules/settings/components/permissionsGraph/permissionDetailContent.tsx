'use client';

import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
    Toggle,
    ToggleGroup,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IDao, IDaoPermission } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ANY_ADDR } from '../../constants/permissionSentinels';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import { PermissionCondition } from '../permissionCondition';

interface IPermissionDetailEntity {
    address: string;
    label?: string;
}

export interface IPermissionDetailContentProps {
    chainId?: number;
    className?: string;
    network?: IDao['network'];
    permissionName: string;
    row: IDaoPermission;
    who?: IPermissionDetailEntity;
    where?: IPermissionDetailEntity;
}

type PermissionDetailsTab = 'permission' | 'condition';

export const PermissionDetailContent: React.FC<
    IPermissionDetailContentProps
> = ({ chainId, className, network, permissionName, row, who, where }) => {
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const [activeTab, setActiveTab] =
        useState<PermissionDetailsTab>('permission');
    const {
        address: conditionAddress,
        label: conditionLabel,
        hasCondition,
        isUnrecognized,
    } = conditionTypeUtils.resolveConditionDisplay(row);
    const hasConditionBreakdown = hasCondition && !isUnrecognized;

    const isWhoAnyAddress = addressUtils.isAddressEqual(
        row.whoAddress,
        ANY_ADDR,
    );
    const isWhereAnyAddress = addressUtils.isAddressEqual(
        row.whereAddress,
        ANY_ADDR,
    );

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
                <DefinitionList.Container>
                    <DefinitionList.Item
                        copyValue={isWhoAnyAddress ? undefined : row.whoAddress}
                        description={who?.label}
                        link={
                            isWhoAnyAddress
                                ? undefined
                                : {
                                      href: buildEntityUrl({
                                          type: ChainEntityType.ADDRESS,
                                          id: row.whoAddress,
                                      }),
                                      isExternal: true,
                                  }
                        }
                        term={t('app.settings.permissionsList.details.who')}
                    >
                        {isWhoAnyAddress
                            ? who?.label
                            : addressUtils.truncateAddress(row.whoAddress)}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        copyValue={
                            isWhereAnyAddress ? undefined : row.whereAddress
                        }
                        description={where?.label}
                        link={
                            isWhereAnyAddress
                                ? undefined
                                : {
                                      href: buildEntityUrl({
                                          type: ChainEntityType.ADDRESS,
                                          id: row.whereAddress,
                                      }),
                                      isExternal: true,
                                  }
                        }
                        term={t('app.settings.permissionsList.details.where')}
                    >
                        {isWhereAnyAddress
                            ? where?.label
                            : addressUtils.truncateAddress(row.whereAddress)}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        copyValue={row.permissionId}
                        description={permissionName}
                        term={t(
                            'app.settings.permissionsList.details.permission',
                        )}
                    >
                        {addressUtils.truncateHash(row.permissionId)}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        copyValue={hasCondition ? conditionAddress : undefined}
                        description={hasCondition ? conditionLabel : undefined}
                        link={
                            hasCondition
                                ? {
                                      href: buildEntityUrl({
                                          type: ChainEntityType.ADDRESS,
                                          id: conditionAddress,
                                      }),
                                      isExternal: true,
                                  }
                                : undefined
                        }
                        term={t(
                            'app.settings.permissionsList.details.condition',
                        )}
                    >
                        {hasCondition
                            ? addressUtils.truncateAddress(conditionAddress)
                            : conditionLabel}
                    </DefinitionList.Item>
                </DefinitionList.Container>
            ) : (
                <PermissionCondition
                    chainId={chainId}
                    network={network}
                    row={row}
                />
            )}
        </div>
    );
};
