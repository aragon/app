'use client';

import { DaoAvatar, Dropdown, Icon, IconType } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { type ChangeEvent, useEffect, useRef } from 'react';
import { wizardReturnToParam } from '@/modules/application/components/navigations/navigationWizard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    useImportWorkspace,
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
 * Workspace switcher of the workspace navigation: every workspace, plus items to create one and import one from a file.
 */
export const WorkspaceSelector: React.FC<IWorkspaceSelectorProps> = (props) => {
    const { workspaceId } = props;

    const { t } = useTranslations();

    const router = useRouter();
    const pathname = usePathname();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });
    const { data: workspaces = [] } = useWorkspaceList();

    const queryClient = useQueryClient();
    const { mutateAsync: importWorkspace } = useImportWorkspace();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // The list key does not name its registry (demo or local), so another workspace reads it again.
    const listWorkspaceIdRef = useRef(workspaceId);
    useEffect(() => {
        if (listWorkspaceIdRef.current === workspaceId) {
            return;
        }

        listWorkspaceIdRef.current = workspaceId;
        void queryClient.invalidateQueries({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
    }, [queryClient, workspaceId]);

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

    const handleImportWorkspace = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (file == null) {
            return;
        }

        try {
            const workspace = await importWorkspace(await file.text());
            handleSelectWorkspace(workspace.id);
        } catch {
            window.alert(t('app.workspace.workspaceSelector.importError'));
        }
    };

    return (
        <>
            <Dropdown.Container
                align="start"
                constrainContentWidth={false}
                customTrigger={
                    <button
                        className="group flex min-h-row w-full cursor-pointer items-center gap-nav-related--fixed-12 rounded-xl border border-surface-default bg-surface-default p-2 pr-control-md text-surface-default focus-ring transition-all ring-accent-focus shadow-surface-sm hover:border-surface-hover hover:bg-surface-hover hover:shadow-surface-default active:border-surface-active active:bg-surface-active active:text-surface-active"
                        type="button"
                    >
                        <span className="flex w-11 shrink-0 items-center">
                            <DaoAvatar
                                name={workspace?.name}
                                size="md"
                                src={ipfsUtils.cidToSrc(workspace?.avatar)}
                            />
                        </span>
                        <span className="grow truncate text-left type-control text-surface-primary">
                            {workspace?.name}
                        </span>
                        <Icon
                            aria-hidden={true}
                            className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
                            icon={IconType.CHEVRON_DOWN}
                            size="sm"
                        />
                    </button>
                }
            >
                {workspaces.map(({ id, name, avatar }) => (
                    <Dropdown.Item
                        key={id}
                        onSelect={() => handleSelectWorkspace(id)}
                        selected={id === workspaceId}
                    >
                        <span className="flex min-w-0 items-center gap-nav-related--fixed-12">
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
                <Dropdown.Item
                    icon={IconType.WITHDRAW}
                    iconPosition="left"
                    onSelect={() => fileInputRef.current?.click()}
                >
                    {t('app.workspace.workspaceSelector.import')}
                </Dropdown.Item>
            </Dropdown.Container>
            {/* Outside the dropdown, whose content unmounts on close. */}
            <input
                accept="application/json,.json"
                aria-label={t('app.workspace.workspaceSelector.import')}
                className="hidden"
                onChange={handleImportWorkspace}
                ref={fileInputRef}
                type="file"
            />
        </>
    );
};
