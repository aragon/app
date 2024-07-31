'use client';
import { DaoDefinitionList } from '@/modules/governance/components/daoDefinitionList/daoDefinitionList';
import { DaoVersionInfoDefinitionList } from '@/modules/governance/components/daoVersionInfoDefinitionList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { type IGetDaoParams } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import type { IDaoSettingTermAndDefinition } from '../../types';
import { DefinitionList, Heading } from '@aragon/ods';

export interface IDaoSettingsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO information.
     */
    initialParams: IGetDaoParams;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();

    const daoId = initialParams.urlParams.id;

    const pluginIds = useDaoPluginIds(daoId);
    const governanceParams = { daoId: daoId };
    const governanceSettings = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: governanceParams,
        slotId: GovernanceSlotId.SETTINGS_GOVERNANCE_INFO,
        pluginIds,
    });

    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <Heading size="h3">DAO</Heading>
                <DaoDefinitionList initialParams={initialParams} />
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
            </Page.Main>
            <Page.Aside>
                <DaoVersionInfoDefinitionList initialParams={initialParams} />
            </Page.Aside>
        </>
    );
};
