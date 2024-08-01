'use client';
import { DaoSettingsInfo } from '@/modules/governance/components/daoSettingsInfo';
import { DaoVersionInfo } from '@/modules/governance/components/daoVersionInfo';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import type { IDaoSettingTermAndDefinition } from '../../types';
import { DaoGovernanceInfo } from '@/modules/governance/components/daoGovernanceInfo';

export interface IDaoSettingsPageClientProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { daoId } = props;
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { t } = useTranslations();

    const pluginIds = useDaoPluginIds(daoId);
    const governanceParams = { daoId: daoId };
    const governanceSettings = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: governanceParams,
        slotId: GovernanceSlotId.GOVERNANCE_SETTINGS_INFO,
        pluginIds,
    });

    if (!dao) {
        return null;
    }
    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <Page.Section title={t('app.governance.daoSettingsPage.main.daoSettingsInfo.title')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
                <Page.Section title={t('app.governance.daoSettingsPage.main.governance.title')}>
                    <DaoGovernanceInfo daoId={daoId} />
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <DaoVersionInfo dao={dao} />
            </Page.Aside>
        </>
    );
};
