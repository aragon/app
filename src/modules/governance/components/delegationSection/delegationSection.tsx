import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import {
    type IFilterComponentPlugin,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { IMember } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DelegationStatementCard } from '../delegationStatementCard';
import { DelegationStatsCard } from '../delegationStatsCard';

export interface IDelegationSectionProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Title of the section.
     */
    title: string;
    /**
     * Member to display the delegation section for.
     */
    member: IMember;
}

export const DelegationSection: React.FC<IDelegationSectionProps> = (props) => {
    const { daoId, title, member } = props;

    const bodiesWithDelegation = useDaoPlugins({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    })?.filter(
        (plugin) =>
            (plugin.meta.settings as ITokenPluginSettings)?.token?.hasDelegate,
    );

    const renderSelectedPlugin = (
        plugin: IFilterComponentPlugin<IDaoPlugin>,
    ) => {
        const tokenAddress = (plugin.meta.settings as ITokenPluginSettings)
            ?.token?.address;

        return (
            <div className="flex flex-col gap-4">
                <DelegationStatsCard
                    daoId={daoId}
                    memberAddress={member.address}
                    plugin={plugin.meta}
                />
                <DelegationStatementCard tokenAddress={tokenAddress} />
            </div>
        );
    };

    return bodiesWithDelegation == null ||
        bodiesWithDelegation.length === 0 ? null : (
        <Page.MainSection title={title}>
            <PluginFilterComponent
                plugins={bodiesWithDelegation}
                renderContent={renderSelectedPlugin}
                slotId={GovernanceSlotId.GOVERNANCE_MEMBER_PANEL}
            />
        </Page.MainSection>
    );
};
