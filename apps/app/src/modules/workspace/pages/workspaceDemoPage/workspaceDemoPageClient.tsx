'use client';

import {
    Avatar,
    addressUtils,
    Card,
    DaoAvatar,
    DataList,
    Icon,
    IconType,
    Tag,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import safeWallet from '@/assets/images/safeWallet.png';
import { FooterSidebar } from '@/modules/application/components/footer';
import { LayoutSidebar } from '@/modules/application/components/layouts/layoutSidebar';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Link } from '@/shared/components/link';
import {
    type INavigationLink,
    Navigation,
} from '@/shared/components/navigation';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

interface DemoAccount {
    address: string;
    name: string;
    network: string;
    type: 'dao' | 'safe';
    threshold?: number;
    owners?: number;
}

const demoAccounts: DemoAccount[] = [
    {
        address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        name: 'Citrea DAO',
        network: 'Citrea',
        type: 'dao',
    },
    {
        address: '0x5F2c8A1b9D3e7C4a6B0d2E8f1A9c3B7d5E6f4A2c',
        name: 'Citrea Ops Safe',
        network: 'Ethereum',
        owners: 5,
        threshold: 3,
        type: 'safe',
    },
    {
        address: '0x9B7d3E1f5A2c8D4b6E0a9C3f7B1d5E8a2C6f4D0b',
        name: 'Citrea Grants Safe',
        network: 'Citrea',
        owners: 3,
        threshold: 2,
        type: 'safe',
    },
];

const demoNavigationLinks: INavigationLink[] = [
    {
        icon: IconType.APP_DASHBOARD,
        label: 'app.workspace.demo.navigation.dashboard',
        link: '/demo',
    },
    {
        icon: IconType.APP_MEMBERS,
        label: 'app.workspace.demo.navigation.accounts',
        link: '/demo#accounts',
    },
];

const WorkspaceDemoAccount: React.FC<{ account: DemoAccount }> = ({
    account,
}) => {
    const { t } = useTranslations();
    const { address, name, network, owners, threshold, type } = account;
    const isDao = type === 'dao';

    return (
        <DataList.Item className="flex items-center gap-3 p-4 md:p-6">
            {isDao ? (
                <DaoAvatar className="shrink-0" name={name} size="md" />
            ) : (
                <Avatar
                    alt={t('app.workspace.demo.account.safeAvatar')}
                    className="shrink-0"
                    size="md"
                    src={safeWallet.src}
                />
            )}
            <div className="flex min-w-0 grow flex-col">
                <span className="truncate text-base text-neutral-800 leading-tight">
                    {name}
                </span>
                <span
                    className="truncate text-neutral-500 text-sm leading-tight"
                    title={address}
                >
                    {network} · {addressUtils.truncateAddress(address)}
                </span>
                {!isDao && threshold != null && owners != null && (
                    <span className="text-neutral-500 text-sm leading-tight">
                        {t('app.workspace.demo.account.threshold', {
                            owners,
                            threshold,
                        })}
                    </span>
                )}
            </div>
            <Tag
                className="shrink-0"
                label={t(`app.workspace.demo.account.type.${type}`)}
                variant={isDao ? 'primary' : 'neutral'}
            />
        </DataList.Item>
    );
};

export const WorkspaceDemoPageClient: React.FC = () => {
    const { t } = useTranslations();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const demoWorkspaceName = t('app.workspace.demo.name');

    const accountSummary = (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-3">
            <DaoAvatar name="Citrea DAO" size="md" />
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-neutral-800 text-sm">
                    Citrea DAO
                </span>
                <span className="truncate text-neutral-500 text-xs">
                    {addressUtils.truncateAddress(demoAccounts[0].address)}
                </span>
            </div>
        </div>
    );

    const navigation = (
        <>
            <Navigation.Sidebar
                aria-label={t('app.workspace.demo.navigation.label')}
                footer={
                    <>
                        <Tag
                            className="self-start"
                            label={t('app.workspace.demo.readOnly')}
                            variant="neutral"
                        />
                        <FooterSidebar />
                    </>
                }
                header={
                    <>
                        <Link
                            aria-label={t(
                                'app.workspace.demo.navigation.landing',
                            )}
                            className="mx-2 mb-4"
                            href="/"
                        >
                            <AragonLogo size="md" />
                        </Link>
                        {accountSummary}
                        <span className="px-3 pt-1 text-neutral-500 text-sm">
                            {demoWorkspaceName}
                        </span>
                    </>
                }
                links={demoNavigationLinks}
            />
            <Navigation.Container
                aria-label={t('app.workspace.demo.navigation.label')}
                className="lg:hidden"
                containerClasses="flex flex-col gap-2 py-3 md:py-5"
            >
                <div className="flex items-center justify-between gap-3">
                    <Link
                        aria-label={t('app.workspace.demo.navigation.landing')}
                        className="shrink-0"
                        href="/"
                    >
                        <AragonLogo responsiveIconOnly={true} size="md" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Tag
                            label={t('app.workspace.demo.readOnly')}
                            variant="neutral"
                        />
                        <Navigation.Trigger
                            aria-label={t('app.workspace.demo.navigation.open')}
                            className="shrink-0"
                            onClick={() => setDialogOpen(true)}
                        />
                    </div>
                </div>
                <Navigation.Dialog
                    hiddenDescription={t(
                        'app.workspace.demo.navigation.dialog.description',
                    )}
                    hiddenTitle={t(
                        'app.workspace.demo.navigation.dialog.title',
                    )}
                    links={demoNavigationLinks}
                    onOpenChange={setDialogOpen}
                    open={isDialogOpen}
                >
                    <div className="flex flex-col gap-3 px-4">
                        {accountSummary}
                        <div className="flex items-center justify-between gap-3 px-3">
                            <span className="text-neutral-500 text-sm">
                                {demoWorkspaceName}
                            </span>
                            <Tag
                                label={t('app.workspace.demo.readOnly')}
                                variant="neutral"
                            />
                        </div>
                    </div>
                </Navigation.Dialog>
            </Navigation.Container>
        </>
    );

    return (
        <LayoutSidebar navigation={navigation}>
            <Page.Container>
                <Page.Header
                    avatar={<DaoAvatar name={demoWorkspaceName} size="2xl" />}
                    description={t('app.workspace.demo.description')}
                    stats={[
                        {
                            label: t('app.workspace.demo.stat.accounts'),
                            value: demoAccounts.length,
                        },
                        {
                            label: t('app.workspace.demo.stat.targets'),
                            value: 0,
                        },
                    ]}
                    title={demoWorkspaceName}
                />
                <Page.Content>
                    <Page.Main className="max-w-4xl">
                        <Page.MainSection
                            description={t(
                                'app.workspace.demo.todo.description',
                            )}
                            title={t('app.workspace.demo.todo.title')}
                        >
                            <Card className="flex items-start gap-4 p-4 md:p-6">
                                <Icon
                                    className="shrink-0 text-primary-400"
                                    icon={IconType.INFO}
                                />
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-neutral-800">
                                        {t(
                                            'app.workspace.demo.todo.readOnlyTitle',
                                        )}
                                    </span>
                                    <p className="text-neutral-500 text-sm">
                                        {t(
                                            'app.workspace.demo.todo.readOnlyDescription',
                                        )}
                                    </p>
                                </div>
                            </Card>
                        </Page.MainSection>
                        <Page.MainSection
                            aria-label={t(
                                'app.workspace.demo.section.accounts',
                            )}
                            id="accounts"
                            role="region"
                            title={t('app.workspace.demo.section.accounts')}
                        >
                            <div className="flex flex-col gap-3 md:gap-2">
                                {demoAccounts.map((account) => (
                                    <WorkspaceDemoAccount
                                        account={account}
                                        key={account.address}
                                    />
                                ))}
                            </div>
                        </Page.MainSection>
                    </Page.Main>
                </Page.Content>
            </Page.Container>
        </LayoutSidebar>
    );
};
