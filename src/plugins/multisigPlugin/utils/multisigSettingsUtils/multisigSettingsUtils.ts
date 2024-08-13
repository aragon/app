import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { type IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { type TranslationFunction } from '@/shared/components/translationsProvider';

export interface IMultisigSettingsParseParams {
    /**
     * Settings passed into the function either from the DAO or the proposal.
     */
    settings: IDaoMultisigSettings;
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

        return [
            {
                term: t('app.plugins.multisig.multisigGovernanceSettings.minimumApproval'),
                definition: t('app.plugins.multisig.multisigGovernanceSettings.approvals', {
                    min: settings.settings.minApprovals,
                    max: membersCount,
                }),
            },
            {
                term: t('app.plugins.multisig.multisigGovernanceSettings.proposalCreation'),
                definition: settings.settings.onlyListed
                    ? t('app.plugins.multisig.multisigGovernanceSettings.members')
                    : t('app.plugins.multisig.multisigGovernanceSettings.anyWallet'),
            },
        ];
    };
}

export const multisigSettingsUtils = new MultisigSettingsUtils();
