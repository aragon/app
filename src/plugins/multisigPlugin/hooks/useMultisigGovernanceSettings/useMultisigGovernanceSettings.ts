import { useMemberList } from '@/modules/governance/api/governanceService';
import type { IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDaoSettingTermAndDefinition } from '../../../../modules/settings/types';

interface IUseMultisigGovernanceSettingsParams {
    /**
     * ID of the Dao.
     */
    daoId: string;
    /**
     * Settings of the multisig based Dao.
     */
    settings?: IDaoMultisigSettings;
}

export const useMultisigGovernanceSettings = (
    params: IUseMultisigGovernanceSettingsParams,
): IDaoSettingTermAndDefinition[] => {
    const { daoId, settings } = params;

    const { t } = useTranslations();

    const daoSettingsParams = { daoId };
    const { data: memberList } = useMemberList({ queryParams: daoSettingsParams });
    const { data: currentSettings } = useDaoSettings<IDaoMultisigSettings>(
        { urlParams: daoSettingsParams },
        { enabled: settings == null },
    );
    const processedSettings = settings ?? currentSettings;

    if (!processedSettings) {
        return [];
    }

    return [
        {
            term: t('app.plugins.multisig.multisigGovernanceSettings.minimumApproval'),
            definition: t('app.plugins.multisig.multisigGovernanceSettings.approvals', {
                min: processedSettings?.settings.minApprovals,
                // TODO: Grab this from Dao settings when available [APP-3470]
                max: memberList?.pages[0].metadata.totalRecords,
                authorized: processedSettings?.settings.onlyListed ? 'authorized' : '',
            }),
        },
        {
            term: t('app.plugins.multisig.multisigGovernanceSettings.proposalCreation'),
            definition: processedSettings?.settings.onlyListed
                ? t('app.plugins.multisig.multisigGovernanceSettings.members')
                : t('app.plugins.multisig.multisigGovernanceSettings.anyWallet'),
        },
    ];
};
