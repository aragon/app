import { Avatar, addressUtils, DaoAvatar, Tag } from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type { ICreateWorkspaceFormAccount } from '../../components/createWorkspaceForm';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { publishWorkspaceDialogUtils } from './publishWorkspaceDialogUtils';

export interface IPublishWorkspaceDialogAccountProps {
    /**
     * Account of the workspace form.
     */
    account: ICreateWorkspaceFormAccount;
    /**
     * Account as resolved by the workspace accounts API, undefined while the lookup has not resolved.
     */
    accountInfo?: IWorkspaceAccountInfo;
}

/**
 * An account about to be stored with the workspace, as a row of the publish dialog: its avatar, its name, where it
 * lives and whether it is a DAO or a Safe.
 *
 * The name the user gave the account wins, then the indexed name of a DAO; a Safe has no name of its own and is
 * called a Safe. The type is only known once the lookup resolves, so until then the row shows the address alone.
 */
export const PublishWorkspaceDialogAccount: React.FC<
    IPublishWorkspaceDialogAccountProps
> = (props) => {
    const { account, accountInfo } = props;

    const { t } = useTranslations();

    const namespace = 'app.workspace.publishWorkspaceDialog.account';

    const { network, address, metadata } = account;

    const type = workspaceUtils.getAccountType(accountInfo);
    const isDao = type === WorkspaceAccountType.DAO;
    const isSafe = type === WorkspaceAccountType.SAFE;

    const networkName = networkDefinitions[network].name;
    const truncatedAddress = addressUtils.truncateAddress(address);

    const ownName = publishWorkspaceDialogUtils.hasMetadata(account)
        ? metadata?.name.trim()
        : undefined;
    const indexedName =
        accountInfo?.name != null && accountInfo.name !== ''
            ? accountInfo.name
            : undefined;
    const name =
        ownName ?? indexedName ?? (isSafe ? t(`${namespace}.safe`) : undefined);

    const avatarSrc = ownName == null ? undefined : metadata?.avatar?.url;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3">
            {isSafe ? (
                <Avatar
                    alt={t(`${namespace}.safe`)}
                    className="shrink-0"
                    size="md"
                    src={avatarSrc ?? safeWallet.src}
                />
            ) : (
                <DaoAvatar
                    className="shrink-0"
                    name={name}
                    size="md"
                    src={avatarSrc}
                />
            )}
            <div className="flex min-w-0 grow flex-col">
                <span className="truncate text-base leading-tight text-neutral-800">
                    {name ?? truncatedAddress}
                </span>
                <span className="truncate text-sm leading-tight text-neutral-500">
                    {name != null
                        ? `${networkName} · ${truncatedAddress}`
                        : networkName}
                </span>
            </div>
            {type != null && (
                <Tag
                    className="shrink-0"
                    label={t(`${namespace}.type.${isDao ? 'dao' : 'safe'}`)}
                    variant={isDao ? 'primary' : 'neutral'}
                />
            )}
        </div>
    );
};
