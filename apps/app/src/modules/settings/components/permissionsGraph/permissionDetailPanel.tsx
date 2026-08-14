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
            className="absolute z-30 flex max-h-[calc(100%-32px)] w-[360px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-neutral-md"
            ref={panelRef}
            style={style}
        >
            <div
                {...headerProps}
                className="flex cursor-grab touch-none select-none items-start justify-between gap-3 border-neutral-100 border-b p-4 active:cursor-grabbing"
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
            <PermissionDetailContent
                chainId={chainId}
                className="flex flex-col gap-4 overflow-auto p-4"
                daoId={daoId}
                network={network}
                row={row}
                where={where}
                who={who}
            />
        </div>
    );
};
