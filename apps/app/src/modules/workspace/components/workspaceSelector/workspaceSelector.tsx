'use client';

import {
    Button,
    DaoAvatar,
    Dropdown,
    Icon,
    IconType,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { wizardReturnToParam } from '@/modules/application/components/navigations/navigationWizard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    usePinnedWorkspaceId,
    useSetPinnedWorkspaceId,
    useWorkspace,
    useWorkspaceList,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface IWorkspaceSelectorProps {
    /**
     * ID of the current workspace.
     */
    workspaceId: string;
}

/**
 * Workspace switcher of the workspace navigation, listing every workspace plus a link to create a new one. Editing
 * the current workspace lives in the navigation links (Edit workspace), not here. Its trigger is a full-width row,
 * rendered in the sidebar and in the navigation dialog.
 */
export const WorkspaceSelector: React.FC<IWorkspaceSelectorProps> = (props) => {
    const { workspaceId } = props;

    const [isOpen, setIsOpen] = useState(false);

    const { t } = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });
    const { data: workspaces = [] } = useWorkspaceList();
    const pinnedWorkspaceQueryKey = workspaceServiceKeys.pinnedWorkspace();
    const { data: pinnedWorkspaceId = null } = usePinnedWorkspaceId();
    const { mutate: setPinnedWorkspaceId } = useSetPinnedWorkspaceId({
        onSuccess: (_data, id) =>
            queryClient.setQueryData(pinnedWorkspaceQueryKey, id),
    });

    const isPinned = pinnedWorkspaceId === workspaceId;
    const pinLabel = isPinned
        ? t('app.workspace.workspaceSelector.unpin', {
              workspace: workspace?.name ?? '',
          })
        : t('app.workspace.workspaceSelector.pin', {
              workspace: workspace?.name ?? '',
          });

    const handleTogglePinned = () =>
        setPinnedWorkspaceId(isPinned ? null : workspaceId);

    // The account scope belongs to the previous workspace, so the new one opens on its aggregated overview.
    const handleSelectWorkspace = (id: string) =>
        router.push(
            workspaceUtils.getAccountScopeUrl(
                id,
                workspaceAllAccountsSegment,
                'overview',
            ),
        );

    // Exiting the wizard lands back on the workspace page it was opened from.
    const handleCreateWorkspace = () =>
        router.push(
            `/create/workspace?${wizardReturnToParam}=${encodeURIComponent(pathname)}`,
        );

    return (
        <div className="flex items-center gap-2">
            <div className="min-w-0 grow">
                <Dropdown.Container
                    align="start"
                    constrainContentWidth={false}
                    customTrigger={
                        <button
                            aria-label={workspace?.name}
                            className="focus-ring-primary flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 pr-3 text-neutral-500 transition-all hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800"
                            type="button"
                        >
                            <DaoAvatar
                                name={workspace?.name}
                                size="md"
                                src={ipfsUtils.cidToSrc(workspace?.avatar)}
                            />
                            <span className="grow truncate text-left text-base text-neutral-800 leading-tight">
                                {workspace?.name}
                            </span>
                            <Icon
                                className="shrink-0"
                                icon={
                                    isOpen
                                        ? IconType.CHEVRON_UP
                                        : IconType.CHEVRON_DOWN
                                }
                                size="md"
                            />
                        </button>
                    }
                    onOpenChange={setIsOpen}
                    open={isOpen}
                >
                    {workspaces.map(({ id, name, avatar }) => (
                        <Dropdown.Item
                            key={id}
                            onSelect={() => handleSelectWorkspace(id)}
                            selected={id === workspaceId}
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <DaoAvatar
                                    className="shrink-0"
                                    name={name}
                                    size="sm"
                                    src={ipfsUtils.cidToSrc(avatar)}
                                />
                                <span className="truncate">{name}</span>
                            </span>
                        </Dropdown.Item>
                    ))}
                    <Dropdown.Item
                        icon={IconType.PLUS}
                        iconPosition="left"
                        onSelect={handleCreateWorkspace}
                    >
                        {t('app.workspace.workspaceSelector.create')}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
            <Button
                aria-label={pinLabel}
                className="shrink-0"
                iconLeft={
                    isPinned ? IconType.FAVORITE_SELECTED : IconType.FAVORITE
                }
                onClick={handleTogglePinned}
                size="md"
                title={pinLabel}
                type="button"
                variant="tertiary"
            />
        </div>
    );
};
