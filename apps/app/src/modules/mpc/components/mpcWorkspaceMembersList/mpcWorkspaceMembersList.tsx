'use client';

import {
    Button,
    DataList,
    DateFormat,
    formatterUtils,
    IconType,
    Tag,
} from '@aragon/gov-ui-kit';
import {
    useMpcRemoveWorkspaceMember,
    useMpcWorkspaceMembers,
} from '@/modules/mpc/api/mpcService';
import type { IMpcWorkspaceMember } from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { MpcErrorAlert } from '../mpcErrorAlert';

export interface IMpcWorkspaceMembersListProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Whether the current user can manage members (workspace owner).
     */
    canManage?: boolean;
    /**
     * Callback called on the add member action click.
     */
    onAddMemberClick?: () => void;
}

/**
 * Members of a workspace (owner + invited accounts), with add / remove for the owner.
 */
export const MpcWorkspaceMembersList: React.FC<
    IMpcWorkspaceMembersListProps
> = (props) => {
    const { workspaceId, canManage, onAddMemberClick } = props;
    const { t } = useTranslations();

    const { data, isLoading, isError } = useMpcWorkspaceMembers({
        urlParams: { workspaceId },
    });
    const {
        mutate: removeMember,
        isPending,
        error,
        variables,
    } = useMpcRemoveWorkspaceMember();

    const state = isLoading ? 'initialLoading' : isError ? 'error' : 'idle';

    const handleRemove = (member: IMpcWorkspaceMember) => {
        // POC: simple confirmation, no dedicated dialog.
        if (
            window.confirm(
                t('app.mpc.mpcWorkspaceMembersList.removeConfirm', {
                    user: member.username,
                }),
            )
        ) {
            removeMember({ urlParams: { workspaceId, userId: member.userId } });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <MpcErrorAlert error={error} />
            <DataList.Root
                entityLabel={t('app.mpc.mpcWorkspaceMembersList.entity')}
                itemsCount={data?.length}
                state={state}
            >
                <DataList.Container
                    emptyState={{
                        heading: t(
                            'app.mpc.mpcWorkspaceMembersList.empty.heading',
                        ),
                        description: t(
                            'app.mpc.mpcWorkspaceMembersList.empty.description',
                        ),
                        objectIllustration: { object: 'USERS' },
                    }}
                    errorState={{
                        heading: t(
                            'app.mpc.mpcWorkspaceMembersList.error.heading',
                        ),
                        description: t(
                            'app.mpc.mpcWorkspaceMembersList.error.description',
                        ),
                        objectIllustration: { object: 'ERROR' },
                    }}
                >
                    {data?.map((member) => (
                        <DataList.Item
                            className="flex flex-wrap items-center justify-between gap-3"
                            key={member.userId}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-neutral-800">
                                    {member.username}
                                </span>
                                <span className="text-neutral-500 text-sm">
                                    {t(
                                        'app.mpc.mpcWorkspaceMembersList.addedAt',
                                        {
                                            date:
                                                formatterUtils.formatDate(
                                                    member.addedAt,
                                                    {
                                                        format: DateFormat.RELATIVE,
                                                    },
                                                ) ?? member.addedAt,
                                        },
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag
                                    label={t(
                                        `app.mpc.mpcWorkspaceMembersList.role.${member.role}`,
                                    )}
                                    variant={
                                        member.role === 'owner'
                                            ? 'primary'
                                            : 'neutral'
                                    }
                                />
                                {canManage && member.role !== 'owner' && (
                                    <Button
                                        iconLeft={IconType.REMOVE}
                                        isLoading={
                                            isPending &&
                                            variables?.urlParams.userId ===
                                                member.userId
                                        }
                                        onClick={() => handleRemove(member)}
                                        size="sm"
                                        variant="tertiary"
                                    >
                                        {t(
                                            'app.mpc.mpcWorkspaceMembersList.actions.remove',
                                        )}
                                    </Button>
                                )}
                            </div>
                        </DataList.Item>
                    ))}
                </DataList.Container>
            </DataList.Root>
            {canManage && onAddMemberClick != null && (
                <div>
                    <Button
                        iconLeft={IconType.PLUS}
                        onClick={onAddMemberClick}
                        size="md"
                        variant="secondary"
                    >
                        {t('app.mpc.mpcWorkspaceMembersList.actions.add')}
                    </Button>
                </div>
            )}
        </div>
    );
};
