import {
    Avatar,
    addressUtils,
    DaoAvatar,
    DataList,
    type IDataListItemProps,
    Tag,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import safeWallet from '@/assets/images/safeWallet.png';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
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
};

/**
 * Selectable row of the `WorkspaceSelectAccountDialog`.
 *
 * It is the selectable counterpart of the `WorkspaceAccountItem` card of the workspace overview: the rows of a
 * selection dialog are data-list items, which carry the click and the active state, exactly as the process rows
 * of the `SelectPluginDialog` do.
 */
export const WorkspaceSelectAccountDialogItem: React.FC<
    IWorkspaceSelectAccountDialogItemProps
> = (props) => {
    const { account, dao, isActive, ...otherProps } = props;

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
            className={classNames('px-4 py-3 md:p-6', {
                'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary':
                    isActive,
            })}
            {...otherProps}
        >
            <div className="flex items-center gap-3">
                {isDao ? (
                    <DaoAvatar
                        className="shrink-0"
                        name={name}
                        size="md"
                        src={ipfsUtils.cidToSrc(avatar)}
                    />
                ) : (
                    <Avatar
                        alt={t(
                            'app.workspace.workspaceSelectAccountDialogItem.type.safe',
                        )}
                        className="shrink-0"
                        size="md"
                        src={ipfsUtils.cidToSrc(avatar) ?? safeWallet.src}
                    />
                )}
                <div className="flex min-w-0 grow flex-col">
                    <span className="truncate text-base text-neutral-800 leading-tight">
                        {name ?? truncatedAddress}
                    </span>
                    <span className="truncate text-neutral-500 text-sm leading-tight">
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
        </DataList.Item>
    );
};
