import { MemberDataListItem } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type {
    ITokenMember,
    ITokenPluginSettings,
} from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface ITokenMemberListItemProps {
    /**
     * Member to display the information for.
     */
    member: ITokenMember;
    /**
     * ID of the DAO the user is member of.
     */
    daoId: string;
    /**
     * Plugin to display the member for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (
    props,
) => {
    const { member, plugin, daoId } = props;

    const tokenDecimals = plugin.settings.token.decimals;
    const parsedVotingPower = formatUnits(
        BigInt(member.votingPower ?? '0'),
        tokenDecimals,
    );
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    return (
        <MemberDataListItem.Structure
            address={member.address}
            className="min-w-0"
            ensName={member.ens ?? undefined}
            href={daoUtils.getDaoUrl(dao, `members/${member.address}`)}
            key={member.address}
            tokenAmount={parsedVotingPower}
        />
    );
};
