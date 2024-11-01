import { ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IPluginActionData } from '@/modules/governance/components/createProposalForm/createProposalFormActions/createProposalFormActions.api';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { AddMembersAction } from '../../components/multisigProposalActions/addMembersAction';
import { defaultAddMembers } from '../../constants/multisigActionComposerDefinitions';
import type { IMultisigPluginSettings } from '../../types';

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
    getMultisigActions = ({ plugin, t }: IGetMultisigActionsProps): IPluginActionData => {
        const { address, name, subdomain } = plugin;

        return {
            groups: [
                {
                    id: 'address',
                    name: daoUtils.getPluginName(plugin),
                    info: addressUtils.truncateAddress(address),
                    indexData: [address],
                },
            ],
            items: [
                {
                    id: ProposalActionType.MULTISIG_ADD_MEMBERS,
                    name: t(`app.plugins.multisig.actionComposer.action.${ProposalActionType.MULTISIG_ADD_MEMBERS}`),
                    icon: IconType.SETTINGS,
                    groupId: name ?? subdomain,
                    defaultValue: defaultAddMembers,
                },
                // {
                //     id: ProposalActionType.MULTISIG_REMOVE_MEMBERS,
                //     name: t(`app.plugins.token.actionComposer.action.${ProposalActionType.MINT}`),
                //     icon: IconType.SETTINGS,
                //     groupId: name ?? subdomain,
                //     defaultValue: defaultMintAction,
                // },
            ],
            components: {
                [ProposalActionType.MULTISIG_ADD_MEMBERS]: AddMembersAction,
            },
        };
    };
}

export const multisigActionUtils = new MultisigActionUtils();
