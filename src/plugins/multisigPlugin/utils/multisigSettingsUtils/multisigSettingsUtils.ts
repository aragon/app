import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { type IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { type TranslationFunction } from '@/shared/components/translationsProvider';

export interface IMultisigSettingsParseParams {
    /**
     * Settings passed into the function either from the DAO or the proposal.
     */
    settings: IMultisigPluginSettings;
    /**
     * List of members in the DAO.
     */
    membersCount: number;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class MultisigSettingsUtils {
    parseSettings = (params: IMultisigSettingsParseParams): IDaoSettingTermAndDefinition[] => {
        const { settings, membersCount, t } = params;
        const { minApprovals, onlyListed, historicalMembersCount } = settings;

        const processedMembersCount = historicalMembersCount ?? membersCount;

        return [
            {
                term: t('app.plugins.multisig.multisigGovernanceSettings.minimumApproval'),
                definition: t('app.plugins.multisig.multisigGovernanceSettings.approvals', {
                    min: minApprovals,
                    max: processedMembersCount,
                }),
            },
            {
                term: t('app.plugins.multisig.multisigGovernanceSettings.proposalCreation'),
                definition: onlyListed
                    ? t('app.plugins.multisig.multisigGovernanceSettings.members')
                    : t('app.plugins.multisig.multisigGovernanceSettings.anyWallet'),
            },
        ];
    };
}

export const multisigSettingsUtils = new MultisigSettingsUtils();
