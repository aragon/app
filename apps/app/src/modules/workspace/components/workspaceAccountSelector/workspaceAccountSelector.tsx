'use client';

import {
    type AvatarSize,
    AvatarStack,
    addressUtils,
    DaoAvatar,
    Dropdown,
    Icon,
    IconType,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import safeWallet from '@/assets/images/safeWallet.png';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceAddAccountsDialog } from '../../hooks/useWorkspaceAddAccountsDialog';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAccountAvatar } from '../workspaceAccountAvatar';

export interface IWorkspaceAccountSelectorProps {
    /**
     * ID of the workspace whose accounts are displayed.
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
 * Global account selector of the workspace pages, displaying the avatar and name of every account option. Its trigger
 * is a full-width row, rendered in the sidebar and in the navigation dialog.
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

    const { t } = useTranslations();
    const pathname = usePathname();

    const { options, activeOption } = useWorkspaceAccountOptions();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // The registry stores no avatar for DAO accounts, so it is read from the DAOs, which are cached app-wide. Read
    // for every option rather than the workspace accounts, so an external DAO account gets its avatar too.
    const optionAccounts = useMemo(
        () => options.flatMap((option) => option.account ?? []),
        [options],
    );
    const { daos } = useWorkspaceDaos(optionAccounts);

    const section =
        workspaceUtils.getAccountScopeSection(pathname) ?? fallbackSection;
    // Some sections exist for some scopes alone (proposals, permissions, settings): an option that does not have the
    // current one opens on the overview. A segment the app has no route for is kept as is: it is not found under every
    // scope alike.
    const optionLinks = useMemo(
        () =>
            options.map((option) => {
                const isServed =
                    !workspaceUtils.isAccountSection(section) ||
                    workspaceUtils.isSectionServed(section, {
                        isAllAccounts: option.isAllAccounts,
                        accountType: option.account?.type,
                    });
                const optionSection = isServed ? section : fallbackSection;

                return {
                    option,
                    url: workspaceUtils.getAccountScopeUrl(
                        workspaceId,
                        option.id,
                        optionSection,
                    ),
                };
            }),
        [options, workspaceId, section],
    );

    const handleAddAccounts = useWorkspaceAddAccountsDialog(workspaceId);

    // Hidden while nothing is known yet — before the workspace read only the aggregated option exists — then shown
    // even for a workspace holding no account: its Add account item is how one gets added from here.
    if (workspace == null && options.length <= 1) {
        return null;
    }

    // A DAO's avatar comes from the indexed DAO (the registry stores none), a Safe's from its metadata.
    const getAccountAvatar = (account?: IWorkspaceAccount) =>
        account?.type === WorkspaceAccountType.DAO
            ? daos[account.id]?.avatar
            : account?.metadata?.avatar;

    // The stack clones kit avatars, so it can't take WorkspaceAccountAvatar and resolves the Safe logo itself.
    const getStackAvatar = (account?: IWorkspaceAccount) => {
        const src = ipfsUtils.cidToSrc(getAccountAvatar(account));

        return account?.type === WorkspaceAccountType.SAFE
            ? (src ?? safeWallet.src)
            : src;
    };

    const accountAvatars = options
        .filter((option) => !option.isAllAccounts && !option.isExternal)
        .map((option) => (
            <DaoAvatar
                key={option.id}
                name={option.label}
                src={getStackAvatar(option.account)}
            />
        ));
    // Both the trigger and menu reserve the same width for the auto-sized stack. A lone avatar takes the given size
    // instead of the stack's `md`, so it matches the account rows beside it.
    const renderAllAccountsAvatar = (singleSize: AvatarSize = 'md') =>
        accountAvatars.length > 0 ? (
            <AvatarStack
                aria-hidden={true}
                avatars={accountAvatars}
                className="shrink-0"
                size={accountAvatars.length === 1 ? singleSize : undefined}
            />
        ) : (
            <DaoAvatar
                aria-hidden={true}
                className="shrink-0"
                name={workspace?.name}
                size={singleSize}
                src={ipfsUtils.cidToSrc(workspace?.avatar)}
            />
        );
    const activeOptionAddress =
        activeOption?.account == null
            ? undefined
            : addressUtils.truncateAddress(activeOption.account.address);

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className={classNames(
                        // biome-ignore lint/plugin/noPrimitiveSpacing: frame of the account avatar trigger
                        'group flex min-h-row w-full cursor-pointer items-center gap-nav-related--fixed-12 rounded-xl border border-surface-default bg-surface-default p-2 pr-control-md text-surface-default shadow-surface-sm ring-accent-focus focus-ring transition-all hover:border-surface-hover hover:bg-surface-hover hover:shadow-surface-default active:border-surface-active active:bg-surface-active active:text-surface-active',
                        className,
                    )}
                    type="button"
                >
                    <span className="flex w-11 shrink-0 items-center">
                        {activeOption?.isAllAccounts ? (
                            renderAllAccountsAvatar()
                        ) : (
                            // Unbadged, as in the design.
                            <WorkspaceAccountAvatar
                                avatar={getAccountAvatar(activeOption?.account)}
                                name={activeOption?.label}
                                type={
                                    activeOption?.account?.type ??
                                    WorkspaceAccountType.DAO
                                }
                            />
                        )}
                    </span>
                    <span className="flex min-w-0 grow flex-col text-left">
                        <span className="truncate type-control--tall-line text-surface-primary">
                            {activeOption?.label}
                        </span>
                        {activeOptionAddress != null &&
                            activeOptionAddress !== activeOption?.label && (
                                <span className="truncate type-supporting--compact-detail">
                                    {activeOptionAddress}
                                </span>
                            )}
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
            {optionLinks.map(({ option, url }) => (
                <Dropdown.Item
                    href={url}
                    key={option.id}
                    selected={option.id === activeOption?.id}
                >
                    {/* Dropdown.Item renders its children inside a paragraph, therefore only phrasing content is
                     * allowed here. */}
                    <span className="flex min-w-0 items-center gap-nav-related--fixed-12">
                        <span className="flex w-11 shrink-0 items-center">
                            {option.isAllAccounts ? (
                                renderAllAccountsAvatar('sm')
                            ) : (
                                // An unresolved external account shows its label's initials, unbadged.
                                <WorkspaceAccountAvatar
                                    avatar={getAccountAvatar(option.account)}
                                    name={option.label}
                                    network={option.account?.network}
                                    size="sm"
                                    type={
                                        option.account?.type ??
                                        WorkspaceAccountType.DAO
                                    }
                                />
                            )}
                        </span>
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate">{option.label}</span>
                            {option.account != null &&
                                option.label !==
                                    addressUtils.truncateAddress(
                                        option.account.address,
                                    ) && (
                                    <span className="truncate type-supporting--compact-detail text-surface-secondary">
                                        {addressUtils.truncateAddress(
                                            option.account.address,
                                        )}
                                    </span>
                                )}
                        </span>
                        {option.isExternal && (
                            <span className="shrink-0 type-supporting--compact-detail text-surface-secondary">
                                {t(
                                    'app.workspace.workspaceAccountSelector.notInWorkspace',
                                )}
                            </span>
                        )}
                    </span>
                </Dropdown.Item>
            ))}
            <Dropdown.Item onSelect={handleAddAccounts}>
                {/* biome-ignore lint/plugin/noPrimitiveSpacing: frame of the account avatar trigger */}
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex w-11 shrink-0 items-center">
                        <Icon
                            aria-hidden={true}
                            className="icon-surface-secondary"
                            icon={IconType.PLUS}
                            size="md"
                        />
                    </span>
                    <span className="truncate">
                        {t('app.workspace.workspaceAccountSelector.addAccount')}
                    </span>
                </span>
            </Dropdown.Item>
        </Dropdown.Container>
    );
};
