import {
    Avatar,
    addressUtils,
    DaoAvatar,
    Spinner,
    Tag,
} from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../../api/workspaceQueryService';

export interface ICreateWorkspaceFormAccountIdentityProps {
    /**
     * Account as resolved by the workspace accounts API, undefined while the lookup has not resolved.
     */
    accountInfo?: IWorkspaceAccountInfo;
    /**
     * Displays the loading state when set to true, i.e. while the lookup is in flight.
     */
    isLoading?: boolean;
}

/**
 * Displays what a filled in account address turned out to be, so that the user can tell a DAO from a Safe and
 * confirm they entered the right one.
 *
 * Rendered as an inset band rather than a bare line: it is the result of the fields above it, not another field,
 * and the shared container keeps the row height stable between the loading and the resolved state.
 *
 * Nothing is rendered when the address could not be resolved: the field validation already displays the reason,
 * repeating it here would only add noise.
 */
export const CreateWorkspaceFormAccountIdentity: React.FC<
    ICreateWorkspaceFormAccountIdentityProps
> = (props) => {
    const { accountInfo, isLoading } = props;

    const { t } = useTranslations();

    const namespace = 'app.workspace.createWorkspaceForm.accounts.identity';
    const containerClassName =
        'flex min-h-14 items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3';

    if (isLoading) {
        return (
            <div className={containerClassName}>
                <Spinner size="md" variant="neutral" />
                <span className="text-base text-neutral-500 leading-tight">
                    {t(`${namespace}.resolving`)}
                </span>
            </div>
        );
    }

    if (accountInfo?.status !== WorkspaceAccountInfoStatus.AVAILABLE) {
        return null;
    }

    const { type, name, address } = accountInfo;
    const isDao = type === WorkspaceAccountInfoType.DAO;
    const truncatedAddress = addressUtils.truncateAddress(address);

    // The accounts API only names DAOs, and only when the DAO has a name. Without one the address becomes the
    // primary line instead of being repeated below it, and the type is left to the tag.
    const resolvedName =
        isDao && name != null && name !== '' ? name : undefined;

    return (
        <div className={containerClassName}>
            {isDao ? (
                <DaoAvatar className="shrink-0" name={resolvedName} size="md" />
            ) : (
                <Avatar
                    alt={t(`${namespace}.type.safe`)}
                    className="shrink-0"
                    size="md"
                    src={safeWallet.src}
                />
            )}
            <div className="flex min-w-0 grow flex-col">
                <span className="truncate text-base text-neutral-800 leading-tight">
                    {resolvedName ?? truncatedAddress}
                </span>
                {resolvedName != null && (
                    <span className="truncate text-neutral-500 text-sm leading-tight">
                        {truncatedAddress}
                    </span>
                )}
            </div>
            <Tag
                className="shrink-0"
                label={t(`${namespace}.type.${isDao ? 'dao' : 'safe'}`)}
                variant={isDao ? 'primary' : 'neutral'}
            />
        </div>
    );
};
