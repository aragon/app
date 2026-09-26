'use client';

import { DaoAvatar, Dropdown, Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspace } from '../../api/workspaceService';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import {
    type IWorkspaceAccountFilterOption,
    useWorkspaceAccountSelectorContext,
} from '../workspaceAccountSelectorProvider';

export interface IWorkspaceAccountSelectorProps {
    /**
     * ID of the workspace, whose avatar represents the aggregated option.
     */
    workspaceId: string;
    /**
     * Additional class names of the trigger.
     */
    className?: string;
}

/**
 * Global account selector of the workspace pages, displaying the avatar and name of every account option.
 */
export const WorkspaceAccountSelector: React.FC<
    IWorkspaceAccountSelectorProps
> = (props) => {
    const { workspaceId, className } = props;

    const [isOpen, setIsOpen] = useState(false);

    const { activeOption, setActiveOption, options } =
        useWorkspaceAccountSelectorContext();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // The registry stores no avatar for DAO accounts, so it is read from the DAOs, which are cached app-wide.
    const { daos } = useWorkspaceDaos(workspace?.accounts);

    // A single option is the aggregated one already displayed, so there is nothing to choose between.
    if (options.length <= 1) {
        return null;
    }

    const getOptionAvatar = (option?: IWorkspaceAccountFilterOption) => {
        const avatar = option?.isAllAccounts
            ? workspace?.avatar
            : daos[option?.account?.id ?? '']?.avatar;

        return ipfsUtils.cidToSrc(avatar);
    };

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className={classNames(
                        'focus-ring-primary flex max-w-56 cursor-pointer items-center gap-2 rounded-full border border-neutral-100 bg-neutral-0 p-1 text-neutral-500 transition-all hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800 md:pr-3 xl:max-w-68',
                        className,
                    )}
                    type="button"
                >
                    <DaoAvatar
                        name={activeOption?.label}
                        size="lg"
                        src={getOptionAvatar(activeOption)}
                    />
                    <span className="hidden truncate text-base text-neutral-800 leading-tight md:block">
                        {activeOption?.label}
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
            {options.map((option) => (
                <Dropdown.Item
                    key={option.id}
                    onSelect={() => setActiveOption(option)}
                    selected={option.id === activeOption?.id}
                >
                    <span className="flex min-w-0 items-center gap-3">
                        <DaoAvatar
                            className="shrink-0"
                            name={option.label}
                            size="sm"
                            src={getOptionAvatar(option)}
                        />
                        <span className="truncate">{option.label}</span>
                    </span>
                </Dropdown.Item>
            ))}
        </Dropdown.Container>
    );
};
