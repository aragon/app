'use client';

import {
    addressUtils,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    VoteDataListItem,
    type VoteIndicator,
} from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import { daoMemberSourceUtils } from '@/modules/governance/utils/daoMemberSourceUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import type { ISafeMultisigVoteListProps } from './safeMultisigVoteList.api';

const signersPerPage = 6;

const translationKey = 'app.plugins.safeMultisig.safeMultisigVoteList';

export const SafeMultisigVoteList: React.FC<ISafeMultisigVoteListProps> = (
    props,
) => {
    const { proposal, body, stage, isVeto } = props;
    const network = proposal.network;

    const { t } = useTranslations();
    const { address: connectedAddress } = useWalletAccount();

    const { safeInfo, signers } = useSafeMultisigBodyState({
        network,
        address: body,
        proposal,
        stage,
    });

    // Owner links point at the Safe's own members tab, identified by the canonical Safe body
    // record. A Safe the DAO does not carry as a body has no tab to open, so the row is not a link.
    const safeDaoId = `${network}-${proposal.daoAddress}`;
    const safeBodyPlugin = useDaoPlugins({
        daoId: safeDaoId,
        type: PluginType.BODY,
        pluginAddress: body,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    })?.at(0);

    // A Safe confirmation is only ever agreement: an owner signs or does not, so there is no
    // against-indicator to render here.
    const voteIndicator: VoteIndicator = isVeto === true ? 'veto' : 'approve';
    const state = safeInfo == null ? 'initialLoading' : 'idle';

    // The owner reading the card cares first about whether their own signature is on the report.
    const orderedSigners = [...signers].sort((a, b) => {
        const aIsViewer = addressUtils.isAddressEqual(a, connectedAddress);
        const bIsViewer = addressUtils.isAddressEqual(b, connectedAddress);

        return Number(bIsViewer) - Number(aIsViewer);
    });

    return (
        <DataListRoot
            entityLabel={t(`${translationKey}.entity`)}
            itemsCount={orderedSigners.length}
            pageSize={signersPerPage}
            state={state}
        >
            <DataListContainer
                emptyState={{
                    heading: t(`${translationKey}.empty.heading`),
                    description: t(`${translationKey}.empty.description`),
                    objectIllustration: { object: 'USERS' },
                }}
                SkeletonElement={VoteDataListItem.Skeleton}
            >
                {orderedSigners.map((signer) => (
                    <SafeMultisigVoteListItem
                        href={
                            safeBodyPlugin == null
                                ? undefined
                                : daoMemberSourceUtils.getMemberUrlFromDaoId(
                                      safeDaoId,
                                      signer,
                                      safeBodyPlugin.uniqueId,
                                  )
                        }
                        key={signer}
                        signer={signer}
                        voteIndicator={voteIndicator}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

interface ISafeMultisigVoteListItemProps {
    signer: string;
    href?: string;
    voteIndicator: VoteIndicator;
}

/**
 * Wrapper for a single confirmation that resolves the owner's ENS name.
 */
const SafeMultisigVoteListItem: React.FC<ISafeMultisigVoteListItemProps> = (
    props,
) => {
    const { signer, href, voteIndicator } = props;

    const { data: ensName } = useEnsName(signer);
    const { data: ensAvatar } = useEnsAvatar(ensName);

    return (
        <VoteDataListItem.Structure
            href={href}
            voteIndicator={voteIndicator}
            voter={{
                address: signer,
                avatarSrc: ensAvatar ?? undefined,
                name: ensName ?? undefined,
            }}
        />
    );
};
