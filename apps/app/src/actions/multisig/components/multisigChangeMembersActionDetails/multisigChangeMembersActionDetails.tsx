'use client';

import {
    ChainEntityType,
    DefinitionList,
    Heading,
    type IProposalAction,
    type IProposalActionComponentProps,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import {
    type IMultisigActionChangeMembers,
    MultisigProposalActionType,
} from '@/plugins/multisigPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';

export interface IMultisigChangeMembersActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const MultisigChangeMembersActionDetails: React.FC<
    IMultisigChangeMembersActionDetailsProps
> = (props) => {
    const { action, chainId } = props;

    const { t } = useTranslations();

    const { type, members, currentMembers } =
        action as unknown as IMultisigActionChangeMembers;

    const { buildEntityUrl } = useDaoChain({ chainId, daoId: action.daoId });

    const isAddMembers =
        type === MultisigProposalActionType.MULTISIG_ADD_MEMBERS;

    return (
        <div className="flex w-full flex-col gap-y-6">
            <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                    <MemberDataListItem.Structure
                        address={member.address}
                        avatarSrc={member.avatarSrc}
                        className="grow basis-60"
                        ensName={member.name}
                        href={buildEntityUrl({
                            type: ChainEntityType.ADDRESS,
                            id: member.address,
                        })}
                        key={member.address}
                        target="_blank"
                    />
                ))}
            </div>
            <div>
                <Heading size="h3">
                    {t(
                        'app.actions.multisig.multisigChangeMembersActionDetails.summary',
                    )}
                </Heading>
                <DefinitionList.Container>
                    <DefinitionList.Item
                        term={
                            isAddMembers
                                ? t(
                                      'app.actions.multisig.multisigChangeMembersActionDetails.added',
                                  )
                                : t(
                                      'app.actions.multisig.multisigChangeMembersActionDetails.removed',
                                  )
                        }
                    >
                        <p className="text-neutral-500">
                            {t(
                                isAddMembers
                                    ? 'app.actions.multisig.multisigChangeMembersActionDetails.addedCount'
                                    : 'app.actions.multisig.multisigChangeMembersActionDetails.removedCount',
                                { count: members.length },
                            )}
                        </p>
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        term={t(
                            'app.actions.multisig.multisigChangeMembersActionDetails.existingMembers',
                        )}
                    >
                        <p className="text-neutral-500">
                            {t(
                                'app.actions.multisig.multisigChangeMembersActionDetails.existingCount',
                                {
                                    count: currentMembers,
                                },
                            )}
                        </p>
                    </DefinitionList.Item>
                </DefinitionList.Container>
                <p className="text-neutral-500 text-sm">
                    {t(
                        'app.actions.multisig.multisigChangeMembersActionDetails.blockNote',
                    )}
                </p>
            </div>
        </div>
    );
};
