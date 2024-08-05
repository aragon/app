'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import type { IGetProposalListParams } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import type { IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { DefinitionList } from '@aragon/ods';

export interface IDaoProposalsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO proposal list.
     */
    initialParams: IGetProposalListParams;
}

export const DaoProposalsPageClient: React.FC<IDaoProposalsPageClientProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const pluginIds = useDaoPluginIds(initialParams.queryParams.daoId);
    const governanceParams = { daoId: initialParams.queryParams.daoId };
    const governanceSettings = useSlotFunction<IDaoSettingTermAndDefinition[]>({
        params: governanceParams,
        slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        pluginIds,
    });

        return (
            <>
                <Page.Main title={t('app.governance.daoProposalsPage.main.title')}>
                    <DaoProposalList initialParams={initialParams} />
                </Page.Main>
                <Page.Aside>
                    {governanceSettings && (
                        <Page.Section title={t('app.governance.daoProposalsPage.aside.details.title')} inset={false}>
                            <DefinitionList.Container>
                                {governanceSettings.map((governanceSetting, index) => (
                                    <DefinitionList.Item key={index} term={governanceSetting.term}>
                                        <p className="text-neutral-500">{governanceSetting.definition}</p>
                                    </DefinitionList.Item>
                                ))}
                            </DefinitionList.Container>
                        </Page.Section>
                    )}
                </Page.Aside>
            </>
        );
};
