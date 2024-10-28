import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { defaultMintAction } from '@/modules/governance/components/actionComposer/actionComposerDefinitions';
import { type IPluginActionData } from '@/modules/governance/components/createProposalForm/createProposalFormActions/createProposalFormActions';
import { MintAction } from '@/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/mintAction';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import type { TranslationFunction } from '@/shared/components/translationsProvider';

interface IGetTokenActionsProps {
    /**
     * Name of the plugin.
     */
    name?: string;
    /**
     * Subdomain of the plugin.
     */
    subdomain: string;
    /**
     * Address of the plugin.
     */
    address: string;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class TokenActionUtils {
    getTokenActions = ({ name, subdomain, address, t }: IGetTokenActionsProps): IPluginActionData => {
        return {
            groups: [
                {
                    id: subdomain,
                    name: name ?? subdomain,
                    info: addressUtils.truncateAddress(address),
                    indexData: [address],
                },
            ],
            items: [
                {
                    id: ProposalActionType.TOKEN_MINT,
                    name: t(`app.governance.actionComposer.action.${ProposalActionType.TOKEN_MINT}`),
                    icon: IconType.SETTINGS,
                    groupId: name ?? subdomain,
                    defaultValue: defaultMintAction,
                },
            ],
            components: {
                [ProposalActionType.TOKEN_MINT]: MintAction,
            },
        };
    };
}

export const tokenActionUtils = new TokenActionUtils();
