import {
    Avatar,
    addressUtils,
    DaoAvatar,
    DataList,
    Tag,
} from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

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
    /**
     * ID of the workspace the account belongs to, which the row links into for a DAO account.
     */
    workspaceId: string;
}

/**
 * An account of a workspace, displayed as a row of the workspace overview and linking to the account itself: its
 * pages inside this workspace for a DAO, its address on the block explorer for anything else.
 *
 * The type comes from the registry rather than from the lookup: it was resolved when the workspace was created and
 * is what decides which APIs the workspace pages query, so the row keeps showing it even when the lookup fails.
 */
export const WorkspaceAccountItem: React.FC<IWorkspaceAccountItemProps> = (
    props,
) => {
    const { account, accountInfo, workspaceId } = props;

    const { t } = useTranslations();

    const { type, address, network, metadata } = account;
    const isDao = type === WorkspaceAccountType.DAO;

    const networkName = networkDefinitions[network].name;
    const truncatedAddress = addressUtils.truncateAddress(address);

    const name = workspaceUtils.getAccountName(account, accountInfo);
    const accountUrl = workspaceUtils.getAccountUrl(account, workspaceId);

    // A DAO row points at a page of this app, so it is left to open on the current tab: `DataList.Item` renders the
    // row through the gov-ui-kit core provider, on which the app registers its own `next/link` wrapper, and that is
    // what prefetches the route and follows it client-side. A target would hand the click back to the browser and
    // discard the document, therefore only the block explorer link of any other account keeps one.
    const target = isDao ? undefined : '_blank';

    return (
        <DataList.Item
            className="flex items-center gap-3 p-4 md:p-6"
            href={accountUrl}
            target={target}
        >
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
        </DataList.Item>
    );
};
