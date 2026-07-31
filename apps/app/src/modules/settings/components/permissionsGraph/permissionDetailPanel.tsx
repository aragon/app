'use client';

import {
    addressUtils,
    Button,
    ChainEntityType,
    DefinitionList,
    IconType,
    Toggle,
    ToggleGroup,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import type { IDao } from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import type {
    IPermissionGraph,
    IPermissionGraphEdge,
    IPermissionRow,
} from '../../types';
import {
    conditionTypeUtils,
    UNKNOWN_CONDITION,
} from '../../utils/conditionTypeUtils';
import { NoConditionSlot } from '../noConditionSlot';
import { UnrecognizedConditionSlot } from '../unrecognizedConditionSlot';

export interface IPermissionDetailPanelProps {
    chainId?: number;
    edge: IPermissionGraphEdge;
    network?: IDao['network'];
    nodes: IPermissionGraph['nodes'];
    onClose: () => void;
}

interface IPermissionDetailEntity {
    address: string;
    label?: string;
}

export interface IPermissionDetailContentProps {
    chainId?: number;
    className?: string;
    network?: IDao['network'];
    permissionName: string;
    row: IPermissionRow;
    who?: IPermissionDetailEntity;
    where?: IPermissionDetailEntity;
}

type PermissionDetailsTab = 'permission' | 'condition';

export interface IPermissionDetailCardProps
    extends Omit<IPermissionDetailContentProps, 'className'> {
    className?: string;
    conditionLabel?: string;
    contentClassName?: string;
    headerClassName?: string;
    headerProps?: React.HTMLAttributes<HTMLDivElement>;
    onClose?: () => void;
    rootRef?: React.Ref<HTMLDivElement>;
    style?: React.CSSProperties;
}

export const PermissionDetailContent: React.FC<
    IPermissionDetailContentProps
> = ({ chainId, className, network, permissionName, row, who, where }) => {
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const [activeTab, setActiveTab] =
        useState<PermissionDetailsTab>('permission');
    const conditionAddress = row.conditionAddress ?? ALLOW_FLAG;
    const hasCondition = !addressUtils.isAddressEqual(
        conditionAddress,
        ALLOW_FLAG,
    );
    const conditionType = conditionTypeUtils.resolveConditionType(
        conditionAddress,
        row.condition,
    );
    const hasUnrecognizedCondition = conditionType === UNKNOWN_CONDITION;

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

    const selectedTab = hasCondition ? activeTab : 'permission';

    return (
        <div className={className ?? 'flex flex-col gap-4 p-4'}>
            <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-neutral-800">
                    {t('app.settings.permissionsList.details.heading')}
                </p>
                {hasCondition && (
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
                </DefinitionList.Container>
            ) : hasUnrecognizedCondition ? (
                <UnrecognizedConditionSlot
                    chainId={chainId}
                    conditionAddress={conditionAddress}
                />
            ) : (
                <PluginSingleComponent
                    chainId={chainId}
                    conditionAddress={conditionAddress}
                    Fallback={NoConditionSlot}
                    network={network}
                    pluginAddress={row.whoAddress}
                    pluginId={conditionType}
                    slotId={SettingsSlotId.PERMISSION_CONDITION}
                    {...(hasCondition ? row.condition : undefined)}
                />
            )}
        </div>
    );
};

export const PermissionDetailCard: React.FC<IPermissionDetailCardProps> = ({
    chainId,
    className,
    conditionLabel,
    contentClassName,
    headerClassName,
    headerProps,
    network,
    onClose,
    permissionName,
    rootRef,
    row,
    style,
    where,
    who,
}) => {
    const { t } = useTranslations();

    return (
        <div className={className} ref={rootRef} style={style}>
            <div
                {...headerProps}
                className={classNames(
                    'flex items-start justify-between gap-3 border-neutral-100 border-b p-4',
                    headerClassName,
                    headerProps?.className,
                )}
            >
                <div className="min-w-0">
                    <p className="truncate font-mono text-neutral-900 text-sm">
                        {permissionName}
                    </p>
                    {conditionLabel != null && (
                        <p className="mt-1 w-fit rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700 text-xs">
                            {t(
                                'app.settings.daoPermissionsPage.graphView.edge.condition',
                                { condition: conditionLabel },
                            )}
                        </p>
                    )}
                </div>
                {onClose != null && (
                    <div onPointerDown={(event) => event.stopPropagation()}>
                        <Button
                            aria-label={t(
                                'app.settings.daoPermissionsPage.graphView.detail.close',
                            )}
                            iconLeft={IconType.CLOSE}
                            onClick={onClose}
                            size="sm"
                            variant="tertiary"
                        />
                    </div>
                )}
            </div>
            <PermissionDetailContent
                chainId={chainId}
                className={contentClassName}
                network={network}
                permissionName={permissionName}
                row={row}
                where={where}
                who={who}
            />
        </div>
    );
};

export const PermissionDetailPanel: React.FC<IPermissionDetailPanelProps> = ({
    chainId,
    edge,
    network,
    nodes,
    onClose,
}) => {
    const { row } = edge;
    const who = nodes.find((node) => node.id === edge.source);
    const where = nodes.find((node) => node.id === edge.target);
    const panelRef = useRef<HTMLDivElement>(null);
    const dragOffsetRef = useRef<{ x: number; y: number } | undefined>(
        undefined,
    );
    const [position, setPosition] = useState({ x: 16, y: 16 });
    const [isDragging, setIsDragging] = useState(false);

    const clampPosition = (next: { x: number; y: number }) => {
        const panel = panelRef.current;
        const container = panel?.parentElement;

        if (panel == null || container == null) {
            return next;
        }

        const margin = 16;
        const maxX = Math.max(
            margin,
            container.clientWidth - panel.offsetWidth - margin,
        );
        const maxY = Math.max(
            margin,
            container.clientHeight - panel.offsetHeight - margin,
        );

        return {
            x: Math.min(Math.max(next.x, margin), maxX),
            y: Math.min(Math.max(next.y, margin), maxY),
        };
    };

    const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
        const panel = panelRef.current;

        if (panel == null) {
            return;
        }

        const panelRect = panel.getBoundingClientRect();
        dragOffsetRef.current = {
            x: event.clientX - panelRect.left,
            y: event.clientY - panelRect.top,
        };
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || dragOffsetRef.current == null) {
            return;
        }

        const container = panelRef.current?.parentElement;

        if (container == null) {
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const nextPosition = {
            x: event.clientX - containerRect.left - dragOffsetRef.current.x,
            y: event.clientY - containerRect.top - dragOffsetRef.current.y,
        };

        setPosition(clampPosition(nextPosition));
    };

    const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        dragOffsetRef.current = undefined;
        setIsDragging(false);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    return (
        <PermissionDetailCard
            chainId={chainId}
            className="absolute z-30 flex max-h-[calc(100%-32px)] w-[360px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-neutral-md"
            conditionLabel={edge.conditionLabel}
            contentClassName="flex flex-col gap-4 overflow-auto p-4"
            headerClassName="cursor-grab touch-none select-none active:cursor-grabbing"
            headerProps={{
                onPointerCancel: handleDragEnd,
                onPointerDown: handleDragStart,
                onPointerMove: handleDragMove,
                onPointerUp: handleDragEnd,
            }}
            network={network}
            onClose={onClose}
            permissionName={edge.permissionName}
            rootRef={panelRef}
            row={row}
            style={{ left: position.x, top: position.y }}
            where={where}
            who={who}
        />
    );
};
