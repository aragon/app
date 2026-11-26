import {
    AddressOutput,
    addressUtils,
    Checkbox,
    DataList,
    type IDataListItemProps,
    StateSkeletonBar,
    StateSkeletonCircular,
    Tag,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAccountAvatar } from '../../components/workspaceAccountAvatar';
import { workspaceUtils } from '../../utils/workspaceUtils';

export type IWorkspaceSelectAccountDialogItemProps = IDataListItemProps & {
    /**
     * Account of the workspace to display.
     */
    account: IWorkspaceAccount;
    /**
     * DAO of the account, used for its indexed name and avatar. Undefined for accounts that are not DAOs.
     */
    dao?: IDao;
    /**
     * Account as resolved by the accounts API, used to name accounts that are not DAOs.
     */
    accountInfo?: IWorkspaceAccountInfo;
    /**
     * Renders a checkbox, for selecting several accounts, in place of the account type.
     */
    isMultiSelect?: boolean;
    /**
     * Short note displayed before the checkbox in multi-select mode, e.g. "Member".
     */
    note?: string;
    /**
     * Hides the checkbox in multi-select mode, leaving the note, e.g. for an account listed elsewhere.
     */
    hideCheckbox?: boolean;
    /**
     * Renders the account as selected when set to true.
     */
    isActive?: boolean;
    /**
     * Renders the account as not selectable, dimmed, when set to true.
     */
    isDisabled?: boolean;
    /**
     * Renders the account as already in the workspace: checked, not selectable and not dimmed.
     */
    isInWorkspace?: boolean;
    /**
     * Displays a help text that the connected user cannot act on this account.
     */
    showNotEligibleHelpText?: boolean;
};

/**
 * Selectable row of the `WorkspaceSelectAccountDialog`.
 *
 * It is the selectable counterpart of the `WorkspaceAccountItem` card of the workspace overview: the rows of a
 * selection dialog are data-list items, which carry the click and the active state, exactly as the process rows
 * of the `SelectPluginDialog` do.
 *
 * A disabled row is styled and dimmed as `ProcessDataListItem` does for a process the user may not create
 * proposals for, so both selection dialogs read the same way.
 */
export const WorkspaceSelectAccountDialogItem: React.FC<
    IWorkspaceSelectAccountDialogItemProps
> = (props) => {
    const {
        account,
        dao,
        accountInfo,
        isMultiSelect,
        note,
        hideCheckbox,
        isActive,
        isDisabled,
        isInWorkspace,
        showNotEligibleHelpText,
        ...otherProps
    } = props;

    const { t } = useTranslations();

    const { type, address, network, metadata } = account;
    const isDao = type === WorkspaceAccountType.DAO;

    const networkName = networkDefinitions[network].name;
    const truncatedAddress = addressUtils.truncateAddress(address);

    // The DAOs resolved by `useWorkspaceDaos` already have the workspace metadata applied, so the indexed name is
    // only read when the workspace owner did not name the account themselves.
    // An empty name, which the backend returns for unnamed DAOs, falls back to the address like a missing one.
    const name =
        dao?.name ||
        workspaceUtils.getAccountName(account, accountInfo) ||
        undefined;
    const avatar = dao?.avatar ?? metadata?.avatar;

    // Its reveal trigger is a button, which the row lifts above its click overlay so it can be hovered.
    const addressOutput = <AddressOutput address={address} copy={false} />;

    return (
        <DataList.Item
            className={classNames('px-inset-item py-inset-item--12-16', {
                // Checked but not highlighted: the user did not pick it.
                'border-surface-selected shadow-accent-default! hover:border-surface-selected':
                    isActive && !isInWorkspace,
                'border-surface-disabled-item bg-surface-secondary': isDisabled,
                // The kit drops the hover without a click handler; kept so these rows read like the others.
                'hover:border-surface-hover hover:shadow-surface-default':
                    isInWorkspace,
            })}
            {...otherProps}
            {...(isDisabled || isInWorkspace ? { onClick: undefined } : {})}
        >
            <div className="flex flex-col gap-related">
                <div
                    className={classNames('flex items-center gap-related', {
                        'opacity-60': isDisabled,
                    })}
                >
                    <WorkspaceAccountAvatar
                        avatar={avatar}
                        name={name}
                        network={network}
                        type={type}
                    />
                    <div className="flex min-w-0 grow flex-col gap-tight">
                        <span className="truncate type-title-item--compact-card text-surface-primary">
                            {name ?? addressOutput}
                        </span>
                        {/* An unnamed account is titled by its address, so only the network shows here. */}
                        <span className="flex min-w-0 items-baseline gap-tight--fixed-6 type-supporting--compact-meta">
                            <span className="shrink-0 text-surface-primary">
                                {networkName}
                            </span>
                            {name != null && (
                                <span className="truncate text-surface-secondary">
                                    {addressOutput}
                                </span>
                            )}
                        </span>
                    </div>
                    {isMultiSelect ? (
                        <div className="flex shrink-0 items-center gap-related">
                            {note != null && (
                                <span className="type-control-sm text-surface-secondary">
                                    {note}
                                </span>
                            )}
                            {/* Sits beside the row's overlay button, not inside it, so both toggle the selection. */}
                            {!hideCheckbox && (
                                <Checkbox
                                    aria-label={`${name ?? truncatedAddress}, ${networkName}, ${truncatedAddress}`}
                                    checked={isActive ?? false}
                                    disabled={isDisabled || isInWorkspace}
                                    label=""
                                    onCheckedChange={() =>
                                        (
                                            otherProps.onClick as
                                                | (() => void)
                                                | undefined
                                        )?.()
                                    }
                                />
                            )}
                        </div>
                    ) : (
                        <Tag
                            className="shrink-0"
                            label={t(
                                `app.workspace.workspaceSelectAccountDialogItem.type.${isDao ? 'dao' : 'safe'}`,
                            )}
                            variant={isDao ? 'primary' : 'neutral'}
                        />
                    )}
                </div>
                {showNotEligibleHelpText && (
                    <div className="type-supporting--framework-leading text-surface-tertiary-hint">
                        {t(
                            'app.workspace.workspaceSelectAccountDialogItem.notEligible',
                        )}
                    </div>
                )}
            </div>
        </DataList.Item>
    );
};

/**
 * Loading placeholder of a `WorkspaceSelectAccountDialogItem`: the avatar and the two text lines.
 */
export const WorkspaceSelectAccountDialogItemSkeleton: React.FC = () => (
    <div
        aria-busy="true"
        className="flex items-center gap-related px-inset-item py-inset-item--12-16"
        role="status"
    >
        <StateSkeletonCircular size="md" />
        <div className="flex grow flex-col gap-related--fixed-8">
            <StateSkeletonBar size="lg" width="45%" />
            <StateSkeletonBar width="30%" />
        </div>
    </div>
);
