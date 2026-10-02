'use client';

import { DaoAvatar, Dropdown, Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
 * Being a real anchor is what makes an option open in a new tab, show its target on hover and read as a link to a
 * screen reader. A primary click is then handed to the router, because the server resolves the account either way:
 * a client-side transition still renders `LayoutWorkspaceAccount` on the server and still arrives with the DAO
 * prefetched. Letting the browser follow the anchor instead would additionally discard the document — and with it
 * the workspace registry, which cannot be read during a server render, so every switch would blank the page behind
 * `WorkspaceGate`'s spinner while local storage is read again.
 */
export const WorkspaceAccountSelector: React.FC<
    IWorkspaceAccountSelectorProps
> = (props) => {
    const { workspaceId, className } = props;

    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
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

    // manually prefetch when the dialog is opened;
    // this can be removed if the dropdown item can be a Link component
    useEffect(() => {
        if (isOpen) {
            for (const { url } of optionLinks) {
                router.prefetch(url);
            }
        }
    }, [isOpen, optionLinks, router]);

    // A single option is the aggregated one already displayed, so there is nothing to choose between.
    if (options.length <= 1) {
        return null;
    }

    const handleAccountSelect = (url: string) => router.push(url);

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
                    icon={
                        option.id === accountId
                            ? IconType.CHECKMARK
                            : IconType.CHEVRON_RIGHT
                    }
                    key={option.id}
                    onSelect={() => handleAccountSelect(url)}
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
