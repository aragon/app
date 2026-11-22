'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPermissionGraph, IPermissionGraphEdge } from '../../types';
import { PermissionDetailContent } from './permissionDetailContent';
import { useDraggablePanel } from './useDraggablePanel';

export interface IPermissionDetailPanelProps {
    chainId?: number;
    daoId?: string;
    edge: IPermissionGraphEdge;
    network?: IDao['network'];
    nodes: IPermissionGraph['nodes'];
    onClose: () => void;
}

export const PermissionDetailPanel: React.FC<IPermissionDetailPanelProps> = ({
    chainId,
    daoId,
    edge,
    network,
    nodes,
    onClose,
}) => {
    const { t } = useTranslations();
    const { row } = edge;
    const who = nodes.find((node) => node.id === edge.source);
    const where = nodes.find((node) => node.id === edge.target);
    const { panelRef, headerProps, style } = useDraggablePanel();

    return (
        <div
            className="absolute z-30 flex max-h-[calc(100%-32px)] w-[360px] flex-col overflow-hidden rounded-lg border border-surface-secondary-panel bg-surface-primary shadow-surface-md"
            ref={panelRef}
            style={style}
        >
            <div
                {...headerProps}
                className="flex cursor-grab touch-none items-start justify-between gap-related border-b border-surface-secondary p-inset-surface-flat--fixed-16 select-none active:cursor-grabbing"
            >
                <div className="min-w-0">
                    <p className="truncate type-supporting--compact-detail type-mono text-surface-primary-panel-title">
                        {edge.permissionName}
                    </p>
                    {edge.conditionLabel != null && (
                        <p className="mt-tight w-fit rounded bg-surface-tertiary px-inset-tight--fixed-6 py-inset-tight type-caption--unstepped text-surface-primary-detail">
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
            {/* Keyed by edge so selecting another permission remounts the
                subtree: it resets the tab and prevents a condition slot from
                re-rendering with a different hook count. */}
            <PermissionDetailContent
                chainId={chainId}
                className="flex flex-col gap-group overflow-auto p-inset-surface-flat--fixed-16"
                daoId={daoId}
                key={edge.id}
                network={network}
                row={row}
                where={where}
                who={who}
            />
        </div>
    );
};
