'use client';

import {
    addressUtils,
    DaoAvatar,
    Dropdown,
    Icon,
    IconType,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import safeWallet from '@/assets/images/safeWallet.png';
import { wizardReturnToParam } from '@/modules/application/components/navigations/navigationWizard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspace, WorkspaceAccountType } from '../../api/workspaceService';
import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import {
    type IWorkspaceAccountOption,
    useWorkspaceAccountOptions,
} from '../../hooks/useWorkspaceAccountOptions';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import {
    workspaceDaoAccountSections,
    workspaceUtils,
} from '../../utils/workspaceUtils';

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

    const [isOpen, setIsOpen] = useState(false);

    const pathname = usePathname();

    const { t } = useTranslations();
    const { options, activeOption } = useWorkspaceAccountOptions();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // The registry stores no avatar for DAO accounts, so it is read from the DAOs, which are cached app-wide.
    const { daos } = useWorkspaceDaos(workspace?.accounts);

    const section =
        workspaceUtils.getAccountScopeSection(pathname) ?? fallbackSection;

    const optionLinks = useMemo(
        () =>
            options.map((option) => {
                // Permissions and settings exist for a DAO account alone: any other option opens on the overview.
                const isDaoOnlySection = (
                    workspaceDaoAccountSections as readonly string[]
                ).includes(section);
                const optionSection =
                    isDaoOnlySection &&
                    option.account?.type !== WorkspaceAccountType.DAO
                        ? fallbackSection
                        : section;

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

    // Exiting the wizard lands back on the page the account was added from.
    const addAccountUrl = `${workspaceUtils.getWorkspaceEditUrl(
        workspaceId,
        WorkspaceWizardStep.ACCOUNTS,
    )}&${wizardReturnToParam}=${encodeURIComponent(pathname)}`;

    // Hidden while nothing is known yet — before the workspace read only the aggregated option exists — then shown
    // even for a workspace holding no account: its Add account item is how one gets added from here.
    if (workspace == null && options.length <= 1) {
        return null;
    }

    const getOptionAvatar = (option?: IWorkspaceAccountOption) => {
        if (option?.isAllAccounts) {
            return ipfsUtils.cidToSrc(workspace?.avatar);
        }

        switch (option?.account?.type) {
            case WorkspaceAccountType.SAFE:
                return (
                    ipfsUtils.cidToSrc(option.account?.metadata?.avatar) ??
                    safeWallet.src
                );
            case WorkspaceAccountType.DAO:
                return ipfsUtils.cidToSrc(daos[option.account.id]?.avatar);

            default:
                return ipfsUtils.cidToSrc(option?.account?.metadata?.avatar);
        }
    };

    // An unnamed account is labelled by its truncated address already, so the line is skipped rather than repeated.
    const subtitle =
        activeOption?.account != null
            ? addressUtils.truncateAddress(activeOption.account.address)
            : t('app.workspace.workspaceAccountSelector.accounts', {
                  count: workspace?.accounts.length ?? 0,
              });

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className={classNames(
                        'focus-ring-primary flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 pr-3 text-neutral-500 transition-all hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800',
                        className,
                    )}
                    type="button"
                >
                    <DaoAvatar
                        name={activeOption?.label}
                        size="md"
                        src={getOptionAvatar(activeOption)}
                    />
                    <span className="flex min-w-0 grow flex-col text-left leading-tight">
                        <span className="truncate text-base text-neutral-800">
                            {activeOption?.label}
                        </span>
                        {subtitle !== activeOption?.label && (
                            <span className="truncate text-neutral-500 text-sm">
                                {subtitle}
                            </span>
                        )}
                    </span>
                    <Icon
                        className="shrink-0"
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
                        option.id === activeOption?.id
                            ? IconType.CHECKMARK
                            : IconType.CHEVRON_RIGHT
                    }
                    key={option.id}
                    selected={option.id === activeOption?.id}
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
            <Dropdown.Item
                href={addAccountUrl}
                icon={IconType.PLUS}
                iconPosition="left"
            >
                {t('app.workspace.workspaceAccountSelector.addAccount')}
            </Dropdown.Item>
        </Dropdown.Container>
    );
};
