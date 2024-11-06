import { ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IPluginActionComposerData } from '@/modules/governance/components/actionComposer/actionComposer.api';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { AddMembersAction } from '../../components/multisigProposalActions/addMembersAction';
import { RemoveMembersAction } from '../../components/multisigProposalActions/removeMembersAction';
import type { IMultisigPluginSettings } from '../../types';
import { defaultAddMembers, defaultRemoveMembers } from './multisigActionDefinitions';

interface IGetMultisigActionsProps {
    /**
     * DAO plugin data.
     */
    plugin: IDaoPlugin<IMultisigPluginSettings>;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class MultisigActionUtils {
    getMultisigActions = ({ plugin, t }: IGetMultisigActionsProps): IPluginActionComposerData => {
        const { address } = plugin;

        return {
            groups: [
                {
                    id: address,
                    name: daoUtils.getPluginName(plugin),
                    info: addressUtils.truncateAddress(address),
                    indexData: [address],
                },
            ],
            items: [
                {
                    id: ProposalActionType.MULTISIG_ADD_MEMBERS,
                    name: t(`app.plugins.multisig.multisigActions.${ProposalActionType.MULTISIG_ADD_MEMBERS}`),
                    icon: IconType.PLUS,
                    groupId: address,
                    defaultValue: defaultAddMembers,
                },
                {
                    id: ProposalActionType.MULTISIG_REMOVE_MEMBERS,
                    name: t(`app.plugins.multisig.multisigActions.${ProposalActionType.MULTISIG_REMOVE_MEMBERS}`),
                    icon: IconType.MINUS,
                    groupId: address,
                    defaultValue: defaultRemoveMembers,
                },
            ],
            components: {
                [ProposalActionType.MULTISIG_ADD_MEMBERS]: AddMembersAction,
                [ProposalActionType.MULTISIG_REMOVE_MEMBERS]: RemoveMembersAction,
            },
        };
    };
}

export const multisigActionUtils = new MultisigActionUtils();
