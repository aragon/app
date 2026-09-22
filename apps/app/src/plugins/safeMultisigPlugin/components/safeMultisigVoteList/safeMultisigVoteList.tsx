'use client';

import {
    addressUtils,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    IconType,
    VoteDataListItem,
    type VoteIndicator,
} from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { safeAppHistoryUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import { daoMemberSourceUtils } from '@/modules/governance/utils/daoMemberSourceUtils';
import { safeDataListUtils } from '@/modules/safe/utils/safeDataListUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeSettledReportOutcome } from '../../hooks/useSafeSettledReport';
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
    //
    // `signers` covers both halves of a body's life: the queued report while it is collecting
    // confirmations, and the executed one afterwards - the queue stops serving a transaction the
    // moment it executes, so a settled body's confirmations come from history.
    const { signers, isLoading, isError, settledReportOutcome } =
        useSafeMultisigBodyState({
            network,
            address: body,
            proposal,
            stage,
        });

    /**
     * A settled body whose executed report was not recovered. "No confirmations yet" would be false
     * either way - a full set was collected to execute at all - but only a scan that reached an
     * answer may say why: a failed read has no standing to claim the report does not exist, and the
     * list's own error state covers it.
     */
    const isScanExhausted =
        settledReportOutcome === SafeSettledReportOutcome.SCAN_EXHAUSTED;
    const isNotReported =
        settledReportOutcome === SafeSettledReportOutcome.NOT_REPORTED;

    let emptyKey = 'empty';

    if (isScanExhausted) {
        emptyKey = 'settledScanExhausted';
    } else if (isNotReported) {
        emptyKey = 'settledNotReported';
    }

    // The link is only worth offering where there is more history to look through.
    const historyHref = isScanExhausted
        ? safeAppHistoryUrl({ network, address: body })
        : undefined;

    const safeDaoId = `${network}-${proposal.daoAddress}`;
    const memberSourceId = daoMemberSourceUtils.getSafeSourceId(
        safeDaoId,
        body,
    );

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
                    heading: t(`${translationKey}.${emptyKey}.heading`),
                    description: t(`${translationKey}.${emptyKey}.description`),
                    objectIllustration: { object: 'USERS' },
                    ...(historyHref != null
                        ? {
                              primaryButton: {
                                  label: t(
                                      `${translationKey}.${emptyKey}.action`,
                                  ),
                                  href: historyHref,
                                  target: '_blank',
                                  rel: 'noopener',
                                  iconRight: IconType.LINK_EXTERNAL,
                              },
                          }
                        : {}),
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
                        href={daoMemberSourceUtils.getMemberUrlFromDaoId(
                            safeDaoId,
                            signer,
                            memberSourceId,
                        )}
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
