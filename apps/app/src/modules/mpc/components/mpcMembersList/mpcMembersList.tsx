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
    useMpcMembers,
    useMpcRemoveMember,
} from '@/modules/mpc/api/mpcService';
import type { IMpcMember } from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { MpcErrorAlert } from '../mpcErrorAlert';

export interface IMpcMembersListProps {
    /**
     * ID of the system.
     */
    systemId: string;
    /**
     * Whether the current user can manage members (owner).
     */
    canManage?: boolean;
    /**
     * Callback called on the add member action click.
     */
    onAddMemberClick?: () => void;
}

const roleVariant = (role: IMpcMember['role']) =>
    role === 'owner' ? 'primary' : role === 'approver' ? 'info' : 'neutral';

export const MpcMembersList: React.FC<IMpcMembersListProps> = (props) => {
    const { systemId, canManage, onAddMemberClick } = props;
    const { t } = useTranslations();

    const { data, isLoading, isError } = useMpcMembers({
        urlParams: { systemId },
    });
    const {
        mutate: removeMember,
        isPending,
        error,
        variables,
    } = useMpcRemoveMember();

    const state = isLoading ? 'initialLoading' : isError ? 'error' : 'idle';

    const handleRemove = (member: IMpcMember) => {
        // POC: simple confirmation, no dedicated dialog.
        if (
            window.confirm(
                t('app.mpc.mpcMembersList.removeConfirm', {
                    user: member.username,
                }),
            )
        ) {
            removeMember({ urlParams: { systemId, userId: member.userId } });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <MpcErrorAlert error={error} />
            <DataList.Root
                entityLabel={t('app.mpc.mpcMembersList.entity')}
                itemsCount={data?.length}
                state={state}
            >
                <DataList.Container
                    emptyState={{
                        heading: t('app.mpc.mpcMembersList.empty.heading'),
                        description: t(
                            'app.mpc.mpcMembersList.empty.description',
                        ),
                        objectIllustration: { object: 'USERS' },
                    }}
                    errorState={{
                        heading: t('app.mpc.mpcMembersList.error.heading'),
                        description: t(
                            'app.mpc.mpcMembersList.error.description',
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
                                    {t('app.mpc.mpcMembersList.addedAt', {
                                        date:
                                            formatterUtils.formatDate(
                                                member.addedAt,
                                                { format: DateFormat.RELATIVE },
                                            ) ?? member.addedAt,
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag
                                    label={t(
                                        `app.mpc.mpcMembersList.role.${member.role}`,
                                    )}
                                    variant={roleVariant(member.role)}
                                />
                                {canManage && (
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
                                            'app.mpc.mpcMembersList.actions.remove',
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
                        {t('app.mpc.mpcMembersList.actions.add')}
                    </Button>
                </div>
            )}
        </div>
    );
};
