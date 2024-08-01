'use client';
import { DaoSettingsInfo } from '@/modules/governance/components/daoSettingsInfo';
import { DaoVersionInfo } from '@/modules/governance/components/daoVersionInfo';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { DefinitionList, Heading } from '@aragon/ods';
import type { IDaoSettingTermAndDefinition } from '../../types';

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
        slotId: GovernanceSlotId.SETTINGS_GOVERNANCE_INFO,
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
                    {governanceSettings != null && (
                        <>
                            <Heading size="h3">Governance</Heading>
                            <DefinitionList.Container className="rounded-2xl border border-neutral-100 bg-neutral-0 p-6">
                                {governanceSettings.map((governanceSetting, index) => (
                                    <DefinitionList.Item key={index} term={governanceSetting.term}>
                                        <p>{governanceSetting.definition}</p>
                                    </DefinitionList.Item>
                                ))}
                            </DefinitionList.Container>
                        </>
                    )}
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <DaoVersionInfo dao={dao} />
            </Page.Aside>
        </>
    );
};
