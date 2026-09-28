'use client';

import { DaoAvatar, Dropdown, Icon, IconType } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspace, useWorkspaceList } from '../../api/workspaceService';

export interface IWorkspaceSelectorProps {
    /**
     * ID of the current workspace.
     */
    workspaceId: string;
}

/**
 * Workspace switcher of the workspace navigation, listing every workspace plus a link to create a new one.
 */
export const WorkspaceSelector: React.FC<IWorkspaceSelectorProps> = (props) => {
    const { workspaceId } = props;

    const [isOpen, setIsOpen] = useState(false);

    const { t } = useTranslations();
    const router = useRouter();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });
    const { data: workspaces = [] } = useWorkspaceList();

    // The account selection belongs to the previous workspace, so the new one is opened on its overview without it.
    const handleSelectWorkspace = (id: string) =>
        router.push(`/workspace/${id}/overview`);

    const handleCreateWorkspace = () => router.push('/create/workspace');

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className="focus-ring-primary flex max-w-56 cursor-pointer items-center gap-3 rounded-full border border-neutral-100 bg-neutral-0 p-1 text-neutral-500 transition-all hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800 md:pr-3 xl:max-w-68"
                    type="button"
                >
                    <DaoAvatar
                        name={workspace?.name}
                        size="lg"
                        src={ipfsUtils.cidToSrc(workspace?.avatar)}
                    />
                    <span className="hidden truncate text-base text-neutral-800 leading-tight md:block">
                        {workspace?.name}
                    </span>
                    <Icon
                        className="hidden shrink-0 md:block"
                        icon={
                            isOpen ? IconType.CHEVRON_UP : IconType.CHEVRON_DOWN
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
    );
};
