'use client';

import {
    addressUtils,
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    useBlockExplorer,
    VoteDataListItem,
    type VoteIndicator,
} from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import { safeDataListUtils } from '@/modules/safe/utils/safeDataListUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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

    // Registered on the vote-list slot, so the component owns its own read. The Safe queries are
    // keyed by address, so this shares the body card's cache entry rather than refetching.
    const { signers, isLoading, isError } = useSafeMultisigBodyState({
        network,
        address: body,
        proposal,
        stage,
    });

    // The owner rows only need a chain link, so resolve the explorer from the body's own network
    // rather than fetching the DAO to rediscover it.
    const { buildEntityUrl } = useBlockExplorer({
        chainId: networkDefinitions[network].id,
    });

    // A Safe confirmation is only ever agreement: an owner signs or does not, so there is no
    // against-indicator to render here.
    const voteIndicator: VoteIndicator = isVeto === true ? 'veto' : 'approve';
    const state = safeDataListUtils.getDataListState({ isError, isLoading });

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
                errorState={{
                    heading: t(`${translationKey}.error.heading`),
                    description: t(`${translationKey}.error.description`),
                    objectIllustration: { object: 'ERROR' },
                }}
                SkeletonElement={VoteDataListItem.Skeleton}
            >
                {orderedSigners.map((signer) => (
                    <SafeMultisigVoteListItem
                        href={buildEntityUrl({
                            type: ChainEntityType.ADDRESS,
                            id: signer,
                        })}
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
 * Wrapper for a single confirmation that resolves the owner's ENS name. Safe owners are not DAO
 * members, so the row links to the block explorer rather than a member profile.
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
            rel="noopener"
            target="_blank"
            voteIndicator={voteIndicator}
            voter={{
                address: signer,
                avatarSrc: ensAvatar ?? undefined,
                name: ensName ?? undefined,
            }}
        />
    );
};
