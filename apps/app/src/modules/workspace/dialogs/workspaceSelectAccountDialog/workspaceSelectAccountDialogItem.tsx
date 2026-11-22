import {
    addressUtils,
    DataList,
    type IDataListItemProps,
    Tag,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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
     * Renders the account as selected when set to true.
     */
    isActive?: boolean;
    /**
     * Renders the account as not selectable when set to true.
     */
    isDisabled?: boolean;
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
        isActive,
        isDisabled,
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
    const name = dao?.name ?? workspaceUtils.getAccountName(account);
    const avatar = dao?.avatar ?? metadata?.avatar;

    return (
        <DataList.Item
            className={classNames('px-inset-item py-inset-item--12-24', {
                'border-surface-selected shadow-primary hover:border-surface-selected hover:!shadow-accent-default':
                    isActive,
                'border-surface-disabled-item bg-surface-secondary': isDisabled,
            })}
            {...otherProps}
            {...(isDisabled ? { onClick: undefined } : {})}
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
                        type={type}
                    />
                    <div className="flex min-w-0 grow flex-col">
                        <span className="truncate type-title-item--compact-card text-surface-primary">
                            {name ?? truncatedAddress}
                        </span>
                        <span className="truncate type-supporting--compact-meta text-surface-secondary">
                            {name != null
                                ? `${networkName} · ${truncatedAddress}`
                                : networkName}
                        </span>
                    </div>
                    <Tag
                        className="shrink-0"
                        label={t(
                            `app.workspace.workspaceSelectAccountDialogItem.type.${isDao ? 'dao' : 'safe'}`,
                        )}
                        variant={isDao ? 'primary' : 'neutral'}
                    />
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
