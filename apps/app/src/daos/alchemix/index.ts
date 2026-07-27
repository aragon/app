import { GovernanceDaoSlotId } from '@/modules/governance/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { AlchemixSubmitVoteOverride } from './components/alchemixSubmitVoteOverride';
import { alchemixTest } from './constants';
import { alchemixTransactionUtils } from './utils/alchemixTransactionUtils';

const alchemixDaos = [alchemixTest];

export const initialiseAlchemix = () => {
    alchemixDaos.forEach((dao) => {
        pluginRegistryUtils
            .registerPlugin(dao)

            .registerSlotComponent({
                slotId: GovernanceDaoSlotId.GOVERNANCE_SUBMIT_VOTE_OVERRIDE,
                pluginId: dao.id,
                component: AlchemixSubmitVoteOverride,
            })

            .registerSlotFunction({
                slotId: GovernanceDaoSlotId.GOVERNANCE_DAO_BUILD_VOTE_DATA,
                pluginId: dao.id,
                function: alchemixTransactionUtils.buildVoteData,
            });
    });
};
