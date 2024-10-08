'use client';

import { DaoGovernanceInfo } from '@/modules/settings/components/daoGovernanceInfo';
import { DaoMembersInfo } from '@/modules/settings/components/daoMembersInfo';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, Dialog, Heading, IllustrationObject } from '@aragon/ods';
import { useState } from 'react';
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
    const [dialogOpen, setDialogOpen] = useState(false);

    const { t } = useTranslations();

    const daoParams = { urlParams: { id: daoId } };
    const { data: dao } = useDao(daoParams);

    if (!dao) {
        return null;
    }

    return (
        <>
            <Page.Main
                title={t('app.settings.daoSettingsPage.main.title')}
                action={{
                    label: 'Process',
                    onClick: () => {
                        setDialogOpen(true);
                    },
                }}
            >
                <Page.Section title={t('app.settings.daoSettingsPage.main.settingsInfoTitle')}>
                    <DaoSettingsInfo dao={dao} />
                </Page.Section>
                <Page.Section title={t('app.settings.daoSettingsPage.main.governanceInfoTitle')}>
                    <Card className="p-6">
                        <DaoGovernanceInfo daoId={daoId} />
                    </Card>
                </Page.Section>
                <Page.Section title={t('app.settings.daoSettingsPage.main.membersInfoTitle')}>
                    <Card className="p-6">
                        <DaoMembersInfo daoId={daoId} />
                    </Card>
                </Page.Section>
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.settings.daoSettingsPage.aside.versionInfoTitle')}>
                    <DaoVersionInfo dao={dao} />
                </Page.Section>
            </Page.Aside>
            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                <Dialog.Content className="flex flex-col gap-y-6 py-10">
                    <div className="px-4">
                        <div className="flex flex-col gap-y-3">
                            <Heading size="h3">Create governance process</Heading>
                            <p className="text-base font-normal leading-normal text-neutral-500">
                                Define any kind of governance process to help your onchain organisation making great
                                decisions and only allow to execute what it’s right for certain decisions 😉
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-x-6 py-4">
                                <IllustrationObject
                                    className="size-16 rounded-full border border-neutral-100"
                                    object="LABELS"
                                />
                                <p className="grow py-4 font-normal leading-normal text-neutral-800">
                                    Describe governance process
                                </p>
                                <p className="text-base font-normal leading-normal text-neutral-500">Step 1</p>
                            </div>
                            <div className="flex items-center gap-x-6 py-4">
                                <IllustrationObject
                                    className="size-16 rounded-full border border-neutral-100"
                                    object="USERS"
                                />
                                <p className="grow py-4 font-normal leading-normal text-neutral-800">
                                    Setup governance process
                                </p>
                                <p className="text-base font-normal leading-normal text-neutral-500">Step 2</p>
                            </div>
                            <div className="flex items-center gap-x-6 py-4">
                                <IllustrationObject
                                    className="size-16 rounded-full border border-neutral-100"
                                    object="SETTINGS"
                                />
                                <p className="t grow py-4 font-normal leading-normal text-neutral-800">
                                    Manage permissions
                                </p>
                                <p className="text-base font-normal leading-normal text-neutral-500">Step 3</p>
                            </div>
                        </div>
                        <div className="flex gap-x-4 pt-6">
                            <Button href={`/dao/${daoId}/create/process`}>Create new</Button>
                            <Button variant="tertiary" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
};
