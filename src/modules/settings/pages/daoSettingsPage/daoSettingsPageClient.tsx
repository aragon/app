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
    const governanceParams = { id: daoId };
    const governanceInformation = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: governanceParams,
        slotId: GovernanceSlotId.SETTINGS_GOVERNANCE_INFO,
        pluginIds,
    });

    console.log('=====>>>>', governanceInformation);

    return (
        <>
            <Page.Main title={t('app.governance.daoSettingsPage.main.title')}>
                <DaoDefinitionList initialParams={initialParams} />
            </Page.Main>
            <Page.Aside>
                <DaoVersionInfoDefinitionList initialParams={initialParams} />
            </Page.Aside>
        </>
    );
};
