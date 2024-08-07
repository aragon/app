import { type IMember } from '@/modules/governance/api/governanceService';
import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { type IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { type ITFuncOptions } from '@/shared/utils/translationsUtils';
import { type InfiniteData } from '@tanstack/react-query';

export interface IMultisigSettingsParseParams {
    settings: IDaoMultisigSettings | IDaoSettingTermAndDefinition[];
    memberList: InfiniteData<IPaginatedResponse<IMember>, unknown>;
    t: (translation: string, options?: ITFuncOptions) => string;
}

class MultisigSettingsUtils {
    parseSettings = (params: IMultisigSettingsParseParams): IDaoSettingTermAndDefinition[] => {
        const { settings, memberList, t } = params;

        const multisigGovernanceTermsMapping: { [key: string]: string } = {
            onlyListed: t('app.plugins.multisig.multisigGovernanceSettings.proposalCreation'),
            minApprovals: t('app.plugins.multisig.multisigGovernanceSettings.minimumApproval'),
        };

        if (Array.isArray(settings)) {
            return settings.map(({ term, definition }) => {
                const mappedTerm = multisigGovernanceTermsMapping[term] || term;
                const mappedDefinition =
                    term === 'onlyListed'
                        ? definition
                            ? t('app.plugins.multisig.multisigGovernanceSettings.members')
                            : t('app.plugins.multisig.multisigGovernanceSettings.anyWallet')
                        : definition;
                return {
                    term: mappedTerm,
                    definition: `${mappedDefinition}`,
                };
            });
        } else {
            return [
                {
                    term: t('app.plugins.multisig.multisigGovernanceSettings.minimumApproval'),
                    definition: t('app.plugins.multisig.multisigGovernanceSettings.approvals', {
                        min: settings.settings.minApprovals,
                        max: memberList.pages[0].metadata.totalRecords,
                    }),
                },
                {
                    term: t('app.plugins.multisig.multisigGovernanceSettings.proposalCreation'),
                    definition: settings.settings.onlyListed
                        ? t('app.plugins.multisig.multisigGovernanceSettings.members')
                        : t('app.plugins.multisig.multisigGovernanceSettings.anyWallet'),
                },
            ];
        }
    };
}

export const multisigSettingsUtils = new MultisigSettingsUtils();
