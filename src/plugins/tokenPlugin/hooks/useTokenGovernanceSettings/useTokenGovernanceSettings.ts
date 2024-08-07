import { type IDaoTokenSettings } from '@/plugins/tokenPlugin/types';
import { useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDaoSettingTermAndDefinition } from '../../../../modules/settings/types';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

interface IUseTokenGovernanceSettingsParams {
    /**
     * ID of the Dao.
     */
    daoId: string;
    /**
     * Settings of the token based Dao.
     */
    settings?: IDaoTokenSettings | IDaoSettingTermAndDefinition[];
}

export const useTokenGovernanceSettings = (
    params: IUseTokenGovernanceSettingsParams,
): IDaoSettingTermAndDefinition[] => {
    const { daoId, settings } = params;

    const { t } = useTranslations();

    const daoSettingsParams = { daoId };
    const { data: currentSettings } = useDaoSettings<IDaoTokenSettings>(
        { urlParams: daoSettingsParams },
        { enabled: settings == null },
    );

    const processedSettings = settings ?? currentSettings;

    if (!processedSettings) {
        return [];
    }

    return tokenSettingsUtils.parseSettings({ settings: processedSettings, t });
};
