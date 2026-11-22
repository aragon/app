import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useConnection } from 'wagmi';
import {
    AddressOutput,
    addressUtils,
    DataList,
    formatterUtils,
    type IDataListItemProps,
    NumberFormat,
    Tag,
} from '../../../../../core';
import type { ICompositeAddress } from '../../../../types';
import { useGukModulesContext } from '../../../gukModulesProvider';
import { MemberAvatar } from '../../../member';
import { getTagVariant, type VoteIndicator } from '../../voteUtils';

export type IVoteDataListItemStructureProps = IDataListItemProps & {
    /**
     * The account details of the voter.
     */
    voter: ICompositeAddress;
    /**
     * Whether the voter is a delegate of the current user or not.
     */
    isDelegate?: boolean;
    /**
     * The vote of the user.
     */
    voteIndicator: VoteIndicator;
    /**
     * Additional description for the vote indicator, displayed after the tag.
     */
    voteIndicatorDescription?: string;
    /**
     * If token-based voting, the amount of token voting power used.
     */
    votingPower?: number | string;
    /**
     * If token-based voting, the symbol of the voting power used.
     */
    tokenSymbol?: string;
    /**
     * Defines if the voting is for vetoing the proposal or not.
     * @default false
     */
    isVeto?: boolean;
};

export const VoteDataListItemStructure: React.FC<IVoteDataListItemStructureProps> = (props) => {
    const {
        voter,
        isDelegate,
        votingPower,
        tokenSymbol,
        voteIndicator,
        voteIndicatorDescription,
        className,
        isVeto = false,
        ...otherProps
    } = props;
    const { address: currentUserAddress, isConnected } = useConnection();

    const { copy } = useGukModulesContext();

    // Avoid SSR/CSR hydration mismatches: the connected address is only known on
    // the client, so only show the "You" tag after mount.
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    const isCurrentUser = hasMounted && isConnected && addressUtils.isAddressEqual(currentUserAddress, voter.address);

    const resolvedUserHandle =
        voter.name != null && voter.name.length > 0 ? voter.name : addressUtils.truncateAddress(voter.address);

    const formattedTokenNumber = formatterUtils.formatNumber(votingPower, { format: NumberFormat.TOKEN_AMOUNT_SHORT });
    const formattedTokenVote =
        formattedTokenNumber != null && tokenSymbol != null ? `${formattedTokenNumber} ${tokenSymbol}` : undefined;

    const isTokenVoting = votingPower != null && tokenSymbol != null;
    const centerInfoClassNames = classNames(
        'flex min-h-[46.5px] w-full min-w-0 shrink flex-col justify-center gap-y-tight leading-tight md:text-lg',
    );

    return (
        <DataList.Item
            className={classNames('flex items-center gap-x-related--12-16 py-inset-item', className)}
            {...otherProps}
        >
            <MemberAvatar
                address={voter.address}
                avatarSrc={voter.avatarSrc}
                ensName={voter.name}
                responsiveSize={{ md: 'md' }}
                size="sm"
            />
            <div className={centerInfoClassNames}>
                <span className="flex items-center gap-x-tight--4-6 text-base text-surface-primary md:text-lg">
                    <AddressOutput address={voter.address} className="truncate" label={resolvedUserHandle} />
                    {isDelegate && !isCurrentUser && (
                        <Tag label={copy.voteDataListItemStructure.yourDelegate} variant="primary" />
                    )}
                    {isCurrentUser && <Tag label={copy.voteDataListItemStructure.you} variant="neutral" />}
                </span>
                {isTokenVoting && (
                    <span className="truncate text-sm text-surface-secondary md:text-base">{formattedTokenVote}</span>
                )}
            </div>

            <div className="flex items-center gap-x-tight--4-8 text-sm leading-tight font-normal text-surface-secondary md:text-base">
                <Tag
                    className="capitalize"
                    data-testid="tag"
                    label={voteIndicator}
                    variant={getTagVariant(voteIndicator, isVeto)}
                />
                {voteIndicatorDescription && <span className="whitespace-nowrap">{voteIndicatorDescription}</span>}
            </div>
        </DataList.Item>
    );
};
