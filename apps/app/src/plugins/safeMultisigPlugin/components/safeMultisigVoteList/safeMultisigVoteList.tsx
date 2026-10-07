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
import type {
    ISafeMultisigVoteListProps,
    ISafeMultisigVoteListViewProps,
} from './safeMultisigVoteList.api';

const signersPerPage = 6;

const translationKey = 'app.plugins.safeMultisig.safeMultisigVoteList';

export const SafeMultisigVoteListView: React.FC<
    ISafeMultisigVoteListViewProps
> = (props) => {
    const {
        connectedAddress,
        daoAddress,
        isLoading = false,
        isVeto,
        network,
        safeAddress,
        signers,
    } = props;
    const { t } = useTranslations();
    const safeDaoId = `${network}-${daoAddress}`;
    const safeBodyPlugin = useDaoPlugins({
        daoId: safeDaoId,
        type: PluginType.BODY,
        pluginAddress: safeAddress,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    })?.at(0);
    const voteIndicator: VoteIndicator = isVeto === true ? 'veto' : 'approve';
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
            state={isLoading ? 'initialLoading' : 'idle'}
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

export const SafeMultisigVoteList: React.FC<ISafeMultisigVoteListProps> = (
    props,
) => {
    const { proposal, body, stage, isVeto } = props;
    const { address: connectedAddress } = useWalletAccount();
    const { safeInfo, signers } = useSafeMultisigBodyState({
        network: proposal.network,
        address: body,
        proposal,
        stage,
    });

    return (
        <SafeMultisigVoteListView
            connectedAddress={connectedAddress}
            daoAddress={proposal.daoAddress}
            isLoading={safeInfo == null}
            isVeto={isVeto}
            network={proposal.network}
            safeAddress={body}
            signers={signers}
        />
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
