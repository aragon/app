'use client';

import {
    addressUtils,
    Button,
    DefinitionList,
    IconType,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { useRef, useState } from 'react';
import type { IDao } from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionGraph, IPermissionGraphEdge } from '../../types';
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

export const PermissionDetailPanel: React.FC<IPermissionDetailPanelProps> = ({
    chainId,
    edge,
    network,
    nodes,
    onClose,
}) => {
    const { t } = useTranslations();
    const { row } = edge;
    const who = nodes.find((node) => node.id === edge.source);
    const where = nodes.find((node) => node.id === edge.target);
    const hasCondition = !addressUtils.isAddressEqual(
        row.conditionAddress,
        ALLOW_FLAG,
    );
    const conditionType = conditionTypeUtils.resolveConditionType(
        row.conditionAddress,
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
    const panelRef = useRef<HTMLDivElement>(null);
    const dragOffsetRef = useRef<{ x: number; y: number } | undefined>(
        undefined,
    );
    const [position, setPosition] = useState({ x: 16, y: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'permission' | 'condition'>(
        'permission',
    );

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

    const handleTabChange = (value?: string | string[]) => {
        if (value === 'permission' || value === 'condition') {
            setActiveTab(value);
        }
    };

    return (
        <div
            className="absolute z-30 flex max-h-[calc(100%-32px)] w-[360px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-neutral-md"
            ref={panelRef}
            style={{ left: position.x, top: position.y }}
        >
            <div
                className="flex cursor-grab touch-none select-none items-start justify-between gap-3 border-neutral-100 border-b p-4 active:cursor-grabbing"
                onPointerCancel={handleDragEnd}
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
            >
                <div className="min-w-0">
                    <p className="truncate font-mono text-neutral-900 text-sm">
                        {edge.permissionName}
                    </p>
                    {edge.conditionLabel != null && (
                        <p className="mt-1 w-fit rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700 text-xs">
                            {t(
                                'app.settings.daoPermissionsPage.graphView.edge.condition',
                                { condition: edge.conditionLabel },
                            )}
                        </p>
                    )}
                </div>
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
            </div>
            <div className="flex flex-col gap-4 overflow-auto p-4">
                <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-neutral-800">
                        {t('app.settings.permissionsList.details.heading')}
                    </p>
                    <ToggleGroup
                        isMultiSelect={false}
                        onChange={handleTabChange}
                        value={activeTab}
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
                </div>
                {activeTab === 'permission' ? (
                    <DefinitionList.Container>
                        <DefinitionList.Item
                            copyValue={
                                isWhoAnyAddress ? undefined : row.whoAddress
                            }
                            description={who?.label}
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
                            term={t(
                                'app.settings.permissionsList.details.where',
                            )}
                        >
                            {isWhereAnyAddress
                                ? where?.label
                                : addressUtils.truncateAddress(
                                      row.whereAddress,
                                  )}
                        </DefinitionList.Item>
                        <DefinitionList.Item
                            copyValue={row.permissionId}
                            description={edge.permissionName}
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
                        conditionAddress={row.conditionAddress}
                    />
                ) : (
                    <PluginSingleComponent
                        chainId={chainId}
                        conditionAddress={row.conditionAddress}
                        Fallback={NoConditionSlot}
                        network={network}
                        pluginAddress={row.whoAddress}
                        pluginId={conditionType}
                        slotId={SettingsSlotId.PERMISSION_CONDITION}
                        {...(hasCondition ? row.condition : undefined)}
                    />
                )}
            </div>
        </div>
    );
};
