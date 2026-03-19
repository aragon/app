import { MemberDataListItem } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { bigIntUtils } from '@/shared/utils/bigIntUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ITokenMemberListPluginSettings } from '../tokenMemberListBase';

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
    plugin: IDaoPlugin<ITokenMemberListPluginSettings>;
    /**
     * Whether the member is the current user's delegate.
     */
    isDelegate?: boolean;
}

export const TokenMemberListItem: React.FC<ITokenMemberListItemProps> = (
    props,
) => {
    const { member, plugin, daoId, isDelegate } = props;

    const tokenDecimals = plugin.settings.token.decimals;
    const parsedVotingPower = formatUnits(
        bigIntUtils.safeParse(member.votingPower),
        tokenDecimals,
    );
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    return (
        <MemberDataListItem.Structure
            address={member.address}
            className="min-w-0"
            ensName={member.ens ?? undefined}
            href={daoUtils.getDaoUrl(dao, `members/${member.address}`)}
            isDelegate={isDelegate}
            key={member.address}
            tokenAmount={parsedVotingPower}
        />
    );
};
