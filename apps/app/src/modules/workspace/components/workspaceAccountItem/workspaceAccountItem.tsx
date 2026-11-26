import {
    AddressOutput,
    Button,
    Card,
    DataList,
    Dropdown,
    IconType,
    Tag,
} from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAccountAvatar } from '../workspaceAccountAvatar';

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
     * DAO of the account, for the name and avatar the registry does not store. Undefined for other accounts.
     */
    dao?: IDao;
    /**
     * ID of the workspace the account belongs to, which the row links into.
     */
    workspaceId: string;
    /**
     * Renders the row with a "Remove from workspace" menu instead of a link when set.
     */
    onRemove?: () => void;
}

/**
 * An account of a workspace, displayed as a row of the workspace overview and linking into the pages of that
 * account inside this workspace, whatever its type.
 *
 * An account stays inside the workspace rather than leaving for its own `/dao` pages, so that opening one from the
 * overview lands on the same account-scoped route the navigation and the account selector use.
 *
 * The type comes from the registry rather than from the lookup: it was resolved when the workspace was created and
 * is what decides which APIs the workspace pages query, so the row keeps showing it even when the lookup fails.
 */
export const WorkspaceAccountItem: React.FC<IWorkspaceAccountItemProps> = (
    props,
) => {
    const { account, accountInfo, dao, workspaceId, onRemove } = props;

    const { t } = useTranslations();

    const { type, address, network, metadata } = account;
    const isDao = type === WorkspaceAccountType.DAO;

    const networkName = networkDefinitions[network].name;
    // An empty name, which the backend returns for unnamed DAOs, falls back to the address like a missing one.
    const name =
        dao?.name ||
        workspaceUtils.getAccountName(account, accountInfo) ||
        undefined;
    const avatar = dao?.avatar ?? metadata?.avatar;

    // Its reveal trigger is a button, which a link row lifts above its overlay so it can be hovered.
    const addressOutput = <AddressOutput address={address} copy={false} />;

    const content = (
        <>
            <WorkspaceAccountAvatar
                avatar={avatar}
                name={name}
                network={network}
                type={type}
            />
            <div className="flex min-w-0 grow flex-col">
                <span className="truncate type-title-item--compact-card text-surface-primary">
                    {name ?? addressOutput}
                </span>
                <span className="flex gap-1 truncate type-supporting--compact-meta">
                    <span className="text-surface-primary">{networkName}</span>
                    {name != null && (
                        <span className="min-w-0 text-surface-secondary">
                            {addressOutput}
                        </span>
                    )}
                </span>
            </div>
        </>
    );

    // A menu cannot sit inside a link, so a removable row is not one.
    if (onRemove != null) {
        return (
            <Card className="flex items-center gap-3 p-4 md:p-6">
                {content}
                <Dropdown.Container
                    constrainContentWidth={false}
                    customTrigger={
                        <Button
                            aria-label={t(
                                'app.workspace.workspaceAccountItem.menu',
                            )}
                            iconLeft={IconType.DOTS_VERTICAL}
                            size="md"
                            variant="tertiary"
                        />
                    }
                    size="md"
                >
                    <Dropdown.Item onSelect={onRemove}>
                        {t('app.workspace.workspaceAccountItem.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            </Card>
        );
    }

    return (
        <DataList.Item
            className="flex items-center gap-3 p-4 md:p-6"
            href={workspaceUtils.getAccountScopeUrl(
                workspaceId,
                account.id,
                'overview',
            )}
        >
            {content}
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
