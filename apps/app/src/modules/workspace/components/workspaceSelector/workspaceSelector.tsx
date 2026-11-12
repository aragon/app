'use client';

import { DaoAvatar, Dropdown, Icon, IconType } from '@aragon/gov-ui-kit';
import { usePathname, useRouter } from 'next/navigation';
import { wizardReturnToParam } from '@/modules/application/components/navigations/navigationWizard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspace, useWorkspaceList } from '../../api/workspaceService';
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
 * Workspace switcher of the workspace navigation, listing every local workspace plus a link to create a new one.
 * Editing the current workspace lives in the navigation links (Edit workspace), not here. Its trigger is a full-width
 * row.
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
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className="focus-ring-primary flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 pr-3 text-neutral-500 shadow-neutral-sm transition-all hover:border-neutral-200 hover:bg-neutral-50 hover:shadow-neutral active:border-neutral-400 active:bg-neutral-0 active:text-neutral-800"
                    type="button"
                >
                    <span className="flex w-11 shrink-0 items-center">
                        <DaoAvatar
                            name={workspace?.name}
                            size="md"
                            src={ipfsUtils.cidToSrc(workspace?.avatar)}
                        />
                    </span>
                    <span className="grow truncate text-left text-base text-neutral-800 leading-tight">
                        {workspace?.name}
                    </span>
                    <span
                        aria-hidden={true}
                        className="flex shrink-0 flex-col items-center -space-y-1"
                    >
                        <Icon icon={IconType.CHEVRON_UP} size="sm" />
                        <Icon icon={IconType.CHEVRON_DOWN} size="sm" />
                    </span>
                </button>
            }
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
    );
};
