'use client';

import {
    addressUtils,
    Button,
    ChainEntityType,
    DefinitionList,
    IconType,
    Link,
    Tag,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useRef, useState } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionGraphNode, PermissionNodeKind } from '../../types';

const NODE_TYPE_KEY: Record<PermissionNodeKind, string> = {
    dao: 'app.settings.daoPermissionsPage.graphView.node.dao',
    linkedDao: 'app.settings.daoPermissionsPage.graphView.node.linkedDao',
    plugin: 'app.settings.daoPermissionsPage.graphView.node.plugin',
    actor: 'app.settings.daoPermissionsPage.graphView.node.actor',
};

export interface IPermissionNodeDetailPanelProps {
    chainId?: number;
    node: IPermissionGraphNode;
    onClose: () => void;
}

export const PermissionNodeDetailPanel: React.FC<
    IPermissionNodeDetailPanelProps
> = (props) => {
    const { chainId, node, onClose } = props;
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const panelRef = useRef<HTMLDivElement>(null);
    const dragOffsetRef = useRef<{ x: number; y: number } | undefined>(
        undefined,
    );
    const [position, setPosition] = useState({ x: 16, y: 16 });
    const [isDragging, setIsDragging] = useState(false);
    const isSentinelAddress =
        addressUtils.isAddressEqual(node.address, ANY_ADDR) ||
        addressUtils.isAddressEqual(node.address, ALLOW_FLAG);

    const explorerUrl = isSentinelAddress
        ? undefined
        : buildEntityUrl({
              type: ChainEntityType.ADDRESS,
              id: node.address,
          });

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
        <div
            className="absolute z-30 flex w-[320px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-neutral-md"
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
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate font-medium text-neutral-900">
                            {node.label}
                        </p>
                        {node.tag != null && (
                            <Tag label={node.tag} variant="primary" />
                        )}
                    </div>
                    <p className="truncate text-neutral-500 text-sm">
                        {t(NODE_TYPE_KEY[node.kind])}
                    </p>
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
            <div className="p-4">
                <DefinitionList.Container>
                    <DefinitionList.Item
                        term={t(
                            'app.settings.daoPermissionsPage.graphView.detail.type',
                        )}
                    >
                        {t(NODE_TYPE_KEY[node.kind])}
                    </DefinitionList.Item>
                    {!isSentinelAddress && (
                        <DefinitionList.Item
                            copyValue={node.address}
                            term={t(
                                'app.settings.daoPermissionsPage.graphView.detail.address',
                            )}
                        >
                            <Link
                                className="w-fit"
                                href={explorerUrl}
                                isExternal={explorerUrl != null}
                            >
                                {addressUtils.truncateAddress(node.address)}
                            </Link>
                        </DefinitionList.Item>
                    )}
                </DefinitionList.Container>
            </div>
        </div>
    );
};
