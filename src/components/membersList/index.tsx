import {Erc20TokenDetails} from '@aragon/sdk-client';
import {formatUnits} from 'ethers/lib/utils';
import React, {useEffect, useState} from 'react';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {DaoMember, isTokenDaoMember} from 'hooks/useDaoMembers';
import {CHAIN_METADATA} from 'utils/constants';
import {getTokenInfo} from 'utils/tokens';
import {ActionItemAddress} from './actionItemAddress';
import {useAccount} from 'wagmi';
import styled from 'styled-components';
import {useScreen} from '@aragon/ods';

type MembersListProps = {
  members: DaoMember[];
  token?: Erc20TokenDetails;
  isCompactMode?: boolean;
};

export const MembersList: React.FC<MembersListProps> = ({
  token,
  members,
  isCompactMode,
}) => {
  const [totalSupply, setTotalSupply] = useState<number>(0);

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address} = useAccount();
  const {isDesktop} = useScreen();

  const isTokenBasedDao = token != null;
  const useCompactMode = isCompactMode ?? !isDesktop;

  useEffect(() => {
    async function fetchTotalSupply() {
      if (provider && token) {
        const {totalSupply: supply, decimals} = await getTokenInfo(
          token.address,
          provider,
          CHAIN_METADATA[network].nativeCurrency
        );
        setTotalSupply(Number(formatUnits(supply, decimals)));
      }
    }
    fetchTotalSupply();
  }, [provider, token, network]);

  const getMemberId = (member: DaoMember) => {
    if (member.address.toLowerCase() === address?.toLowerCase()) {
      return {walletId: 'you' as const, tagLabel: 'You'};
    }

    if (
      isTokenDaoMember(member) &&
      member.delegators.some(
        delegator => delegator.toLowerCase() === address?.toLowerCase()
      )
    ) {
      return {walletId: 'delegate' as const, tagLabel: 'Delegate'};
    }

    return undefined;
  };

  return (
    <table className="overflow-hidden w-full h-full rounded-xl">
      {!useCompactMode && (
        <thead>
          <tr className="text-ui-600 bg-ui-0 border-b border-b-ui-100">
            <TableCellHead>Member</TableCellHead>
            {isDesktop && isTokenBasedDao && (
              <TableCellHead>Voting power</TableCellHead>
            )}
            {isDesktop && isTokenBasedDao && (
              <TableCellHead>Delegations</TableCellHead>
            )}
            <TableCellHead />
          </tr>
        </thead>
      )}
      <tbody>
        {members.map(member =>
          isTokenDaoMember(member) ? (
            <ActionItemAddress
              key={member.address}
              addressOrEns={member.address}
              delegations={member.delegators.length}
              votingPower={member.votingPower}
              tokenSymbol={token?.symbol}
              tokenSupply={totalSupply}
              isTokenDaoMember={true}
              isCompactMode={isCompactMode}
              {...getMemberId(member)}
            />
          ) : (
            <ActionItemAddress
              key={member.address}
              addressOrEns={member.address}
              isCompactMode={isCompactMode}
            />
          )
        )}
      </tbody>
    </table>
  );
};

const TableCellHead = styled.td.attrs({
  className: 'text-left px-3 py-2',
})``;
