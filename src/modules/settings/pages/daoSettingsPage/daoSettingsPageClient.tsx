'use client';

import { CreateDaoDialog } from '@/modules/createDao/constants/moduleDialogs';
import type { ICreateProcessInfoDialogParams } from '@/modules/createDao/dialogs/createProcessInfoDialog';
import { DaoGovernanceInfo } from '@/modules/settings/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/settings/components/daoMembersInfo';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Card } from '@aragon/gov-ui-kit';
import { DaoSettingsInfo } from '../../components/daoSettingsInfo';
import { DaoVersionInfo } from '../../components/daoVersionInfo';

export interface IDaoSettingsPageClientProps {
    /**
     * ID of the Dao
     */
    daoId: string;
}

export const DaoSettingsPageClient: React.FC<IDaoSettingsPageClientProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const daoParams = { urlParams: { id: daoId } };
    const { data: dao } = useDao(daoParams);

    const hasSupportedPlugins = daoUtils.hasSupportedPlugins(dao);

    const handleCreateProcess = () => {
        const params: ICreateProcessInfoDialogParams = { daoId };
        open(CreateDaoDialog.CREATE_PROCESS_INFO, { params });
    };

    if (!dao) {
        return null;
    }

    return (
        <>
            <Page.Main
                title={t('app.settings.daoSettingsPage.main.title')}
                action={{
                    label: t('app.settings.daoSettingsPage.main.action'),
                    onClick: handleCreateProcess,
                    hidden: process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER !== 'true',
                }}
            >
                <Page.Section title={t('app.settings.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
                {hasSupportedPlugins && (
                    <Page.Section title={t('app.settings.daoSettingsPage.main.governanceInfoTitle')}>
                        <Card className="p-6">
                            <DaoGovernanceInfo daoId={daoId} />
                        </Card>
                    </Page.Section>
                )}
                {hasSupportedPlugins && (
                    <Page.Section title={t('app.settings.daoSettingsPage.main.membersInfoTitle')}>
                        <Card className="p-6">
                            <DaoMembersInfo daoId={daoId} />
                        </Card>
                    </Page.Section>
                )}
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.settings.daoSettingsPage.aside.versionInfoTitle')}>
                    <DaoVersionInfo dao={dao} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
