import { type IMember } from '@/modules/governance/api/governanceService';
import { type IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { type IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { type ITFuncOptions } from '@/shared/utils/translationsUtils';
import { type InfiniteData } from '@tanstack/react-query';

export interface IMultisigSettingsParseParams {
    fetchedSettings: IDaoMultisigSettings;
    memberList: InfiniteData<IPaginatedResponse<IMember>, unknown>;
    t: (translation: string, options?: ITFuncOptions) => string;
}

class MultisigSettingsUtils {
    parseSettings = (params: IMultisigSettingsParseParams): IDaoSettingTermAndDefinition[] => {
        const { fetchedSettings, memberList, t } = params;
        
        return [
            {
                term: t('app.plugins.multisig.multisigGovernanceSettings.minimumApproval'),
                definition: t('app.plugins.multisig.multisigGovernanceSettings.approvals', {
                    min: fetchedSettings.settings.minApprovals,
                    max: memberList.pages[0].metadata.totalRecords,
                }),
            },
            {
                term: t('app.plugins.multisig.multisigGovernanceSettings.proposalCreation'),
                definition: fetchedSettings.settings.onlyListed
                    ? t('app.plugins.multisig.multisigGovernanceSettings.members')
                    : t('app.plugins.multisig.multisigGovernanceSettings.anyWallet'),
            },
        ];
    }
}

export const multisigSettingsUtils = new MultisigSettingsUtils();
