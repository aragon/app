import { type IPluginActionData } from '@/modules/governance/components/createProposalForm/createProposalFormActions/createProposalFormActions';

class TokenActionUtils {
    getTokenActions = (): IPluginActionData => {
        return {
            groups: [],
            items: [],
            components: {},
        };
    };
}

export const tokenActionUtils = new TokenActionUtils();
