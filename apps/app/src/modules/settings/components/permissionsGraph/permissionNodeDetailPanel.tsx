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
import { useTranslations } from '@/shared/components/translationsProvider';
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

    const explorerUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: node.address,
    });

    return (
        <div className="absolute top-4 right-4 z-30 flex w-[320px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 shadow-neutral-md">
            <div className="flex items-start justify-between gap-3 border-neutral-100 border-b p-4">
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
            <div className="p-4">
                <DefinitionList.Container>
                    <DefinitionList.Item
                        term={t(
                            'app.settings.daoPermissionsPage.graphView.detail.type',
                        )}
                    >
                        {t(NODE_TYPE_KEY[node.kind])}
                    </DefinitionList.Item>
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
                </DefinitionList.Container>
            </div>
        </div>
    );
};
