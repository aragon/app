import { type IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { type TranslationFunction } from '@/shared/components/translationsProvider';
import type { IDefinitionSetting } from '@aragon/gov-ui-kit';

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
     * Defines if the voting is optimistic/veto or not.
     */
    isVeto?: boolean;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class MultisigSettingsUtils {
    parseSettings = (params: IMultisigSettingsParseParams): IDefinitionSetting[] => {
        const { settings, membersCount, isVeto, t } = params;
        const { minApprovals, onlyListed, historicalMembersCount } = settings;

        const processedMembersCount = historicalMembersCount ?? membersCount;

        return [
            {
                term: t(
                    `app.plugins.multisig.multisigGovernanceSettings.${isVeto ? 'minimumVeto' : 'minimumApproval'}`,
                ),
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
