'use client';

import { Card, Heading, Tag } from '@aragon/gov-ui-kit';
import type { IMpcWorkspace } from '@/modules/mpc/api/mpcService/domain';
import { mpcWorkspacePath } from '@/modules/mpc/constants/mpcConstants';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcWorkspaceCardProps {
    /**
     * Workspace to display.
     */
    workspace: IMpcWorkspace;
    /**
     * Id of the current user (to tag owned workspaces).
     */
    currentUserId?: string;
}

export const MpcWorkspaceCard: React.FC<IMpcWorkspaceCardProps> = (props) => {
    const { workspace, currentUserId } = props;
    const { t } = useTranslations();
    const isOwner = workspace.ownerId === currentUserId;
    const owner = workspace.members.find((member) => member.role === 'owner');

    return (
        <Link className="block" href={mpcWorkspacePath(workspace.id)}>
            <Card className="flex h-full flex-col gap-3 p-6 transition-shadow hover:shadow-neutral-md">
                <div className="flex items-start justify-between gap-3">
                    <Heading size="h3">{workspace.name}</Heading>
                    <Tag
                        label={t(
                            isOwner
                                ? 'app.mpc.mpcWorkspaceCard.owner'
                                : 'app.mpc.mpcWorkspaceCard.member',
                        )}
                        variant={isOwner ? 'primary' : 'neutral'}
                    />
                </div>
                <div className="flex flex-col gap-1 text-neutral-500 text-sm">
                    <span>
                        {t('app.mpc.mpcWorkspaceCard.ownedBy', {
                            owner: owner?.username ?? workspace.ownerId,
                        })}
                    </span>
                    <span>
                        {t('app.mpc.mpcWorkspaceCard.members', {
                            count: workspace.members.length,
                        })}
                    </span>
                </div>
            </Card>
        </Link>
    );
};
