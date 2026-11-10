import { Avatar, DaoAvatar } from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { WorkspaceAccountType } from '../../api/workspaceService';

export interface IWorkspaceAccountAvatarProps {
    /**
     * Type of the account, which decides what stands in for a missing avatar.
     */
    type: WorkspaceAccountType;
    /**
     * Name of the account, the initials of which stand in for the avatar of a DAO that has none.
     */
    name?: string;
    /**
     * Avatar of the account, as an IPFS CID or a URL.
     */
    avatar?: string | null;
}

/**
 * Avatar of a workspace account as the rows of the workspace lists display it: the one of the account when it has
 * one, else the initials of a DAO or the Safe logo.
 */
export const WorkspaceAccountAvatar: React.FC<IWorkspaceAccountAvatarProps> = (
    props,
) => {
    const { type, name, avatar } = props;

    const { t } = useTranslations();

    const src = ipfsUtils.cidToSrc(avatar);

    if (type === WorkspaceAccountType.DAO) {
        return (
            <DaoAvatar className="shrink-0" name={name} size="md" src={src} />
        );
    }

    return (
        <Avatar
            alt={t('app.workspace.workspaceAccountAvatar.safe')}
            className="shrink-0"
            size="md"
            src={src ?? safeWallet.src}
        />
    );
};
