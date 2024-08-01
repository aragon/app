import { PluginComponent } from '@/shared/components/pluginComponent';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMembersInfoProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const DaoMembersInfo: React.FC<IDaoMembersInfoProps> = (props) => {
    const { daoId } = props;

    const pluginIds = useDaoPluginIds(daoId);

    return (
        <PluginComponent slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBERS_INFO} pluginIds={pluginIds} daoId={daoId} />
    );
};
