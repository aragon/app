'use client';

import { DaoAvatar, Dropdown, Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspace } from '../../api/workspaceService';
import {
    type IWorkspaceAccountOption,
    useWorkspaceAccountOptions,
} from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { workspaceUtils } from '../../utils/workspaceUtils';

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
 * Section opened when the current URL names none, e.g. on the bare workspace URL before it redirects.
 */
const fallbackSection = 'overview';

/**
 * Global account selector of the workspace pages, displaying the avatar and name of every account option.
 *
 * Every option is a link to the same section under another account, not a piece of state: the account lives on the
 * route, so switching account is a navigation.
 *
 * Options render through the app's `next/link`, so they open in a new tab, show their target on hover, read as links
 * to a screen reader and navigate client-side. A full page load would discard the workspace registry, which cannot be
 * read during a server render, and blank every switch behind `WorkspaceGate`'s spinner.
 */
export const WorkspaceAccountSelector: React.FC<
    IWorkspaceAccountSelectorProps
> = (props) => {
    const { workspaceId, className } = props;

    const [isOpen, setIsOpen] = useState(false);

    const pathname = usePathname();

    const { options, accountId, activeOption } = useWorkspaceAccountOptions();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // The registry stores no avatar for DAO accounts, so it is read from the DAOs, which are cached app-wide.
    const { daos } = useWorkspaceDaos(workspace?.accounts);

    const section =
        workspaceUtils.getAccountScopeSection(pathname) ?? fallbackSection;

    const optionLinks = useMemo(
        () =>
            options.map((option) => ({
                option,
                url: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    option.id,
                    section,
                ),
            })),
        [options, workspaceId, section],
    );

    // A single option is the aggregated one already displayed, so there is nothing to choose between.
    if (options.length <= 1) {
        return null;
    }

    const getOptionAvatar = (option?: IWorkspaceAccountOption) => {
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
            {optionLinks.map(({ option, url }) => (
                <Dropdown.Item
                    href={url}
                    icon={
                        option.id === accountId
                            ? IconType.CHECKMARK
                            : IconType.CHEVRON_RIGHT
                    }
                    key={option.id}
                    selected={option.id === accountId}
                >
                    {/* Dropdown.Item renders its children inside a paragraph, therefore only phrasing content is
                     * allowed here. */}
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
