'use client';

import {
    AlertCard,
    addressUtils,
    Button,
    ChainEntityType,
    DefinitionList,
    IconType,
    Tag,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionGraphNode } from '../../types';
import { getPermissionNodeTypeKey } from './permissionGraphNode';
import { useDraggablePanel } from './useDraggablePanel';

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
    const { panelRef, headerProps, style } = useDraggablePanel();
    const isSentinelAddress =
        addressUtils.isAddressEqual(node.address, ANY_ADDR) ||
        addressUtils.isAddressEqual(node.address, ALLOW_FLAG);
    const isAnyoneSentinel = addressUtils.isAddressEqual(
        node.address,
        ANY_ADDR,
    );

    const explorerUrl = isSentinelAddress
        ? undefined
        : buildEntityUrl({
              type: ChainEntityType.ADDRESS,
              id: node.address,
          });

    return (
        <div
            className="absolute z-30 flex w-[320px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-neutral-md"
            ref={panelRef}
            style={style}
        >
            <div
                className="flex cursor-grab touch-none select-none items-start justify-between gap-3 border-neutral-100 border-b p-4 active:cursor-grabbing"
                {...headerProps}
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
                        {t(getPermissionNodeTypeKey(node))}
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
                {isAnyoneSentinel ? (
                    <AlertCard
                        message={t(
                            'app.settings.daoPermissionsPage.graphView.detail.anyone.title',
                        )}
                        variant="info"
                    >
                        {t(
                            'app.settings.daoPermissionsPage.graphView.detail.anyone.description',
                        )}
                    </AlertCard>
                ) : (
                    <DefinitionList.Container>
                        <DefinitionList.Item
                            term={t(
                                'app.settings.daoPermissionsPage.graphView.detail.type',
                            )}
                        >
                            {t(getPermissionNodeTypeKey(node))}
                        </DefinitionList.Item>
                        {!isSentinelAddress && (
                            <DefinitionList.Item
                                copyValue={node.address}
                                link={{ href: explorerUrl, isExternal: true }}
                                term={t(
                                    'app.settings.daoPermissionsPage.graphView.detail.address',
                                )}
                            >
                                {addressUtils.truncateAddress(node.address)}
                            </DefinitionList.Item>
                        )}
                    </DefinitionList.Container>
                )}
            </div>
        </div>
    );
};
