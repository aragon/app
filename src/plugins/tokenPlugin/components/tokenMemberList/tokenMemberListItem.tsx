import { useDaoSettings } from '@/shared/api/daoService';
import { MemberDataListItem } from '@aragon/ods';
import { formatUnits } from 'viem';
import type { IDaoTokenSettings, ITokenMember } from '../../types';

export interface ITokenMemberListItemProps {
    /**
     * Member to display the information for.
     */
    member: ITokenMember;
    /**
     * ID of the DAO the user is member of.
     */
    daoId: string;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (props) => {
    const { member, daoId } = props;

    const daoSettingsParams = { daoId };
    const { data: settings } = useDaoSettings<IDaoTokenSettings>({ urlParams: daoSettingsParams });

    const tokenDecimals = settings?.token.decimals ?? 0;
    const parsedVotingPower = formatUnits(BigInt(member.votingPower), tokenDecimals);

    return (
        <MemberDataListItem.Structure
            key={member.address}
            address={member.address}
            tokenAmount={parsedVotingPower}
            ensName={member.ens ?? undefined}
            className="min-w-0"
            href={`/dao/${daoId}/members/${member.address}`}
            delegationCount={member.metrics.delegateReceivedCount}
        />
    );
};
