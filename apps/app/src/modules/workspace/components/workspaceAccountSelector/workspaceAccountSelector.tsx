'use client';

import {
    AddressOutput,
    AvatarIcon,
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
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceAccountOption,
    useWorkspaceAccountOptions,
} from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceAddAccountsDialog } from '../../hooks/useWorkspaceAddAccountsDialog';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAccountAvatar } from '../workspaceAccountAvatar';

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

    // The account's own name, undefined when unnamed: an avatar then shows no initials of an address.
    const getName = (option?: IWorkspaceAccountOption) =>
        option?.hasName ? option.label : undefined;

    const accountAvatars = options
        .filter((option) => !option.isAllAccounts)
        .map((option) => (
            <DaoAvatar
                key={option.id}
                name={getName(option)}
                src={getStackAvatar(option.account)}
            />
        ));
    // An unnamed account is shown by its address alone, named by the address book. A named account shows its name and
    // the plain short address below it: resolving that address would repeat the name. Inside a menu button or item, so
    // the address only reveals on hover and has no buttons of its own.
    const getAddressOutput = (account?: IWorkspaceAccount) =>
        account == null ? undefined : (
            <AddressOutput
                address={account.address}
                chainId={networkDefinitions[account.network].id}
                copy={false}
                hasInteractiveAncestor={true}
            />
        );
    const activeAddressOutput = getAddressOutput(activeOption?.account);

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className={classNames(
                        'group flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 pr-3 text-neutral-500 shadow-neutral-sm transition-all focus-ring-primary hover:border-neutral-200 hover:bg-neutral-50 hover:shadow-neutral active:border-neutral-400 active:bg-neutral-0 active:text-neutral-800',
                        className,
                    )}
                    type="button"
                >
                    <span className="flex w-11 shrink-0 items-center">
                        {activeOption?.isAllAccounts ? (
                            accountAvatars.length > 0 ? (
                                <AvatarStack
                                    aria-hidden={true}
                                    avatars={accountAvatars}
                                />
                            ) : (
                                <DaoAvatar
                                    name={workspace?.name}
                                    size="md"
                                    src={ipfsUtils.cidToSrc(workspace?.avatar)}
                                />
                            )
                        ) : (
                            // Unbadged, as in the design.
                            <WorkspaceAccountAvatar
                                avatar={getAccountAvatar(activeOption?.account)}
                                name={getName(activeOption)}
                                type={
                                    activeOption?.account?.type ??
                                    WorkspaceAccountType.DAO
                                }
                            />
                        )}
                    </span>
                    <span className="flex min-w-0 grow flex-col text-left leading-tight">
                        <span className="truncate text-base text-neutral-800">
                            {getName(activeOption) ??
                                activeAddressOutput ??
                                activeOption?.label}
                        </span>
                        {activeOption?.hasName &&
                            activeOption.account != null && (
                                <span className="truncate text-sm">
                                    {addressUtils.truncateAddress(
                                        activeOption.account.address,
                                    )}
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
                    <span className="flex min-w-0 items-center gap-3">
                        {option.isAllAccounts ? (
                            <AvatarIcon
                                className="shrink-0"
                                icon={IconType.RICHTEXT_LIST_UNORDERED}
                                size="sm"
                                variant="primary"
                            />
                        ) : (
                            // An unresolved external account has no network yet, so it shows unbadged.
                            <WorkspaceAccountAvatar
                                avatar={getAccountAvatar(option.account)}
                                name={getName(option)}
                                network={option.account?.network}
                                size="sm"
                                type={
                                    option.account?.type ??
                                    WorkspaceAccountType.DAO
                                }
                            />
                        )}
                        <span className="flex min-w-0 flex-col leading-tight">
                            <span className="truncate">
                                {getName(option) ??
                                    getAddressOutput(option.account) ??
                                    option.label}
                            </span>
                            {option.hasName && option.account != null && (
                                <span className="truncate text-sm text-neutral-500">
                                    {addressUtils.truncateAddress(
                                        option.account.address,
                                    )}
                                </span>
                            )}
                        </span>
                        {option.isExternal && (
                            <span className="shrink-0 text-sm text-neutral-500">
                                {t(
                                    'app.workspace.workspaceAccountSelector.notInWorkspace',
                                )}
                            </span>
                        )}
                    </span>
                </Dropdown.Item>
            ))}
            <Dropdown.Item
                icon={IconType.PLUS}
                iconPosition="left"
                onSelect={handleAddAccounts}
            >
                {t('app.workspace.workspaceAccountSelector.addAccount')}
            </Dropdown.Item>
        </Dropdown.Container>
    );
};
