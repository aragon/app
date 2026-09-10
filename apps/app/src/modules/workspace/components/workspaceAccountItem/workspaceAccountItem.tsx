import { Avatar, addressUtils, Card, DaoAvatar, Tag } from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';

export interface IWorkspaceAccountItemProps {
    /**
     * Account of the workspace, as stored on the registry.
     */
    account: IWorkspaceAccount;
    /**
     * Account as resolved by the workspace accounts API, used to display the name of DAO accounts. Undefined while
     * the lookup is pending or when it could not be resolved.
     */
    accountInfo?: IWorkspaceAccountInfo;
}

/**
 * An account of a workspace, displayed as a row of the workspace overview.
 *
 * The type comes from the registry rather than from the lookup: it was resolved when the workspace was created and
 * is what decides which APIs the workspace pages query, so the row keeps showing it even when the lookup fails.
 */
export const WorkspaceAccountItem: React.FC<IWorkspaceAccountItemProps> = (
    props,
) => {
    const { account, accountInfo } = props;

    const { t } = useTranslations();

    const { type, address, network, metadata } = account;
    const isDao = type === WorkspaceAccountType.DAO;

    const networkName = networkDefinitions[network].name;
    const truncatedAddress = addressUtils.truncateAddress(address);

    // The account metadata is what the workspace owner called this account, so it wins over the indexed DAO name.
    const name = metadata?.name ?? accountInfo?.name ?? undefined;

    return (
        <Card className="flex items-center gap-3 border border-neutral-100 p-4 shadow-neutral-sm md:p-6">
            {isDao ? (
                <DaoAvatar
                    className="shrink-0"
                    name={name}
                    size="md"
                    src={ipfsUtils.cidToSrc(metadata?.avatar)}
                />
            ) : (
                <Avatar
                    alt={t('app.workspace.workspaceAccountItem.type.safe')}
                    className="shrink-0"
                    size="md"
                    src={ipfsUtils.cidToSrc(metadata?.avatar) ?? safeWallet.src}
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
                    `app.workspace.workspaceAccountItem.type.${isDao ? 'dao' : 'safe'}`,
                )}
                variant={isDao ? 'primary' : 'neutral'}
            />
        </Card>
    );
};
