'use client';

import {
    Avatar,
    addressUtils,
    Button,
    Card,
    DaoAvatar,
    DataList,
    Dropdown,
    Icon,
    IconType,
    Tag,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
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

export interface IWorkspaceDemoPageClientProps {
    path?: string[];
}

type DemoAccountType = 'dao' | 'safe';
type DemoSection =
    | 'dashboard'
    | 'proposals'
    | 'transactions'
    | 'assets'
    | 'members';

interface DemoAccount {
    address: string;
    description: string;
    id: string;
    name: string;
    network: string;
    type: DemoAccountType;
    owners?: number;
    threshold?: number;
}

const demoAccounts: DemoAccount[] = [
    {
        address: '0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482',
        description:
            'Aragon’s main Ethereum DAO for governing operations and its onchain treasury.',
        id: 'aragon-x',
        name: 'Aragon X (Mainnet)',
        network: 'Ethereum',
        type: 'dao',
    },
    {
        address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
        description: 'Operational treasury controlled by the Aragon team.',
        id: 'operations-safe',
        name: 'Aragon Operations Safe',
        network: 'Ethereum',
        owners: 4,
        threshold: 3,
        type: 'safe',
    },
    {
        address: '0x4A676e7F27A2cC3d6C4f2Cb0f8B7e5a3C8d1A921',
        description: 'Dedicated account for ecosystem grants and payments.',
        id: 'grants-safe',
        name: 'Aragon Grants Safe',
        network: 'Ethereum',
        owners: 3,
        threshold: 2,
        type: 'safe',
    },
];

const demoProposals = [
    { id: 'MULTISIG-265', title: 'Test to new Wallet', age: '10 days ago' },
    {
        id: 'MULTISIG-264',
        title: 'Transfer to Separate wallet',
        age: '10 days ago',
    },
    { id: 'MULTISIG-263', title: 'Transfer to Polygon', age: '14 days ago' },
];

const demoMembers = [
    { address: '0x946138B088524414EEDaf0699BA10d7Fb5673A34', name: 'aragonx' },
    { address: '0x74fA94A61ed477a1f30818a4F5AfB0597Cd85f8d' },
    { address: '0x6775d267e5Df97B7E6d789EaeD1F9215f7093904' },
    { address: '0x29eBE0593aEa5aCDF95C04fD37df614e6C12f8b3' },
];

const demoAssets = [
    { amount: '536.28K', name: 'USD Coin', symbol: 'USDC', value: '$536.71K' },
    { amount: '20K', name: 'Tether', symbol: 'USDT', value: '$19.88K' },
    { amount: '14.19K', name: 'Ethena', symbol: 'ENA', value: '$2.18K' },
];

const demoTransactions = [
    {
        account: 'Aragon Operations Safe',
        age: '10 days ago',
        amount: '50,000 USDC',
        title: 'Treasury transfer',
    },
    {
        account: 'Aragon X (Mainnet)',
        age: '14 days ago',
        amount: '12.5 ETH',
        title: 'Contributor payments',
    },
    {
        account: 'Aragon Grants Safe',
        age: '21 days ago',
        amount: '25,000 USDC',
        title: 'Ecosystem grant',
    },
];

const getAccountUrl = (accountId: string, section: DemoSection = 'dashboard') =>
    `/demo/account/${accountId}/${section}`;

const getNavigationLinks = (account?: DemoAccount): INavigationLink[] => {
    if (account == null) {
        return [
            {
                icon: IconType.APP_DASHBOARD,
                label: 'app.workspace.demo.navigation.dashboard',
                link: '/demo/dashboard',
            },
            {
                icon: IconType.APP_MEMBERS,
                label: 'app.workspace.demo.navigation.accounts',
                link: '/demo/accounts',
            },
        ];
    }

    return [
        {
            icon: IconType.APP_DASHBOARD,
            label: 'app.application.navigationWorkspace.link.dashboard',
            link: getAccountUrl(account.id),
        },
        {
            hidden: account.type !== 'dao',
            icon: IconType.APP_PROPOSALS,
            label: 'app.application.navigationWorkspace.link.proposals',
            link: getAccountUrl(account.id, 'proposals'),
        },
        {
            icon: IconType.APP_TRANSACTIONS,
            label: 'app.application.navigationWorkspace.link.transactions',
            link: getAccountUrl(account.id, 'transactions'),
        },
        {
            icon: IconType.APP_ASSETS,
            label: 'app.application.navigationWorkspace.link.assets',
            link: getAccountUrl(account.id, 'assets'),
        },
        {
            icon: IconType.APP_MEMBERS,
            label: 'app.application.navigationWorkspace.link.members',
            link: getAccountUrl(account.id, 'members'),
        },
    ];
};

const DemoAccountAvatar: React.FC<{
    account: DemoAccount;
    size?: 'md' | '2xl';
}> = ({ account, size = 'md' }) =>
    account.type === 'dao' ? (
        <DaoAvatar className="shrink-0" name={account.name} size={size} />
    ) : (
        <Avatar
            alt="Safe account"
            className="shrink-0"
            size={size}
            src={safeWallet.src}
        />
    );

const DemoWorkspaceSelector: React.FC = () => {
    const { t } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const name = t('app.workspace.demo.name');

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className="focus-ring-primary flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 pr-3 text-neutral-500 transition-all hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800"
                    type="button"
                >
                    <DaoAvatar name={name} size="md" />
                    <span className="grow truncate text-left text-base text-neutral-800 leading-tight">
                        {name}
                    </span>
                    <Icon
                        className="shrink-0"
                        icon={
                            isOpen ? IconType.CHEVRON_UP : IconType.CHEVRON_DOWN
                        }
                        size="md"
                    />
                </button>
            }
            onOpenChange={setIsOpen}
            open={isOpen}
        >
            <Dropdown.Item href="/demo/dashboard" selected={true}>
                <span className="flex min-w-0 items-center gap-3">
                    <DaoAvatar className="shrink-0" name={name} size="sm" />
                    <span className="truncate">{name}</span>
                </span>
            </Dropdown.Item>
            <Dropdown.Item href="/" icon={IconType.PLUS} iconPosition="left">
                {t('app.workspace.workspaceSelector.create')}
            </Dropdown.Item>
        </Dropdown.Container>
    );
};

const DemoAccountSelector: React.FC<{
    account?: DemoAccount;
    section: DemoSection;
}> = ({ account, section }) => {
    const { t } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const allAccountsLabel = t(
        'app.workspace.useWorkspaceAccountOptions.allAccounts',
    );

    const activeLabel = account?.name ?? allAccountsLabel;
    const subtitle =
        account?.address ??
        t('app.workspace.workspaceAccountSelector.accounts', {
            count: demoAccounts.length,
        });

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <button
                    className="focus-ring-primary flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-2 pr-3 text-neutral-500 transition-all hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800"
                    type="button"
                >
                    {account == null ? (
                        <DaoAvatar name={allAccountsLabel} size="md" />
                    ) : (
                        <DemoAccountAvatar account={account} />
                    )}
                    <span className="flex min-w-0 grow flex-col text-left leading-tight">
                        <span className="truncate text-base text-neutral-800">
                            {activeLabel}
                        </span>
                        <span className="truncate text-neutral-500 text-sm">
                            {account == null
                                ? subtitle
                                : addressUtils.truncateAddress(subtitle)}
                        </span>
                    </span>
                    <Icon
                        className="shrink-0"
                        icon={
                            isOpen ? IconType.CHEVRON_UP : IconType.CHEVRON_DOWN
                        }
                        size="md"
                    />
                </button>
            }
            onOpenChange={setIsOpen}
            open={isOpen}
        >
            <Dropdown.Item href="/demo/dashboard" selected={account == null}>
                <span className="flex min-w-0 items-center gap-3">
                    <DaoAvatar
                        className="shrink-0"
                        name={allAccountsLabel}
                        size="sm"
                    />
                    <span className="truncate">{allAccountsLabel}</span>
                </span>
            </Dropdown.Item>
            {demoAccounts.map((option) => (
                <Dropdown.Item
                    href={getAccountUrl(
                        option.id,
                        option.type === 'safe' && section === 'proposals'
                            ? 'dashboard'
                            : section,
                    )}
                    key={option.id}
                    selected={option.id === account?.id}
                >
                    <span className="flex min-w-0 items-center gap-3">
                        <DemoAccountAvatar account={option} size="md" />
                        <span className="flex min-w-0 flex-col leading-tight">
                            <span className="truncate">{option.name}</span>
                            <span className="truncate text-neutral-500 text-sm">
                                {addressUtils.truncateAddress(option.address)}
                            </span>
                        </span>
                    </span>
                </Dropdown.Item>
            ))}
        </Dropdown.Container>
    );
};

const DemoAccountItem: React.FC<{ account: DemoAccount }> = ({ account }) => {
    const { t } = useTranslations();
    const { address, name, network, owners, threshold, type } = account;

    return (
        <Link
            className="focus-ring-primary rounded-xl"
            href={getAccountUrl(account.id)}
        >
            <DataList.Item className="flex items-center gap-3 p-4 transition-colors hover:bg-neutral-50 md:p-6">
                <DemoAccountAvatar account={account} />
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
                    {type === 'safe' && threshold != null && owners != null && (
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
                    variant={type === 'dao' ? 'primary' : 'neutral'}
                />
                <Icon
                    className="shrink-0 text-neutral-300"
                    icon={IconType.CHEVRON_RIGHT}
                />
            </DataList.Item>
        </Link>
    );
};

const DemoProposalList: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-3">
            {demoProposals.map((proposal) => (
                <Card
                    className="flex flex-col gap-3 p-4 md:p-6"
                    key={proposal.id}
                >
                    <div className="flex items-center justify-between gap-3">
                        <Tag
                            label={t('app.workspace.demo.status.executed')}
                            variant="success"
                        />
                        <span className="text-neutral-500 text-sm">
                            {proposal.age}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-neutral-800">
                        <span className="text-neutral-500">{proposal.id}</span>
                        <span>{proposal.title}</span>
                    </div>
                    <span className="text-neutral-500 text-sm">
                        {t('app.workspace.demo.proposal.author')}
                    </span>
                </Card>
            ))}
        </div>
    );
};

const DemoMemberList: React.FC<{ account?: DemoAccount }> = ({ account }) => {
    const members =
        account?.type === 'safe'
            ? demoMembers.slice(0, account.owners)
            : demoMembers;

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
                const label =
                    member.name ?? addressUtils.truncateAddress(member.address);

                return (
                    <Card
                        className="flex items-center gap-3 p-4"
                        key={member.address}
                    >
                        <DaoAvatar name={label} size="md" />
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-neutral-800">
                                {label}
                            </span>
                            <span className="truncate text-neutral-500 text-sm">
                                {addressUtils.truncateAddress(member.address)}
                            </span>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

const DemoAssetList: React.FC<{ safe?: boolean }> = ({ safe = false }) => (
    <div className="flex flex-col gap-3">
        {demoAssets.slice(0, safe ? 2 : undefined).map((asset) => (
            <Card className="flex items-center gap-3 p-4" key={asset.symbol}>
                <DaoAvatar name={asset.symbol} size="md" />
                <div className="flex min-w-0 grow flex-col">
                    <span className="text-neutral-800">{asset.name}</span>
                    <span className="text-neutral-500 text-sm">
                        {asset.symbol}
                    </span>
                </div>
                <div className="flex shrink-0 flex-col text-right">
                    <span className="text-neutral-800">
                        {asset.amount} {asset.symbol}
                    </span>
                    <span className="text-neutral-500 text-sm">
                        {asset.value}
                    </span>
                </div>
            </Card>
        ))}
    </div>
);

const DemoTransactionList: React.FC<{ account?: DemoAccount }> = ({
    account,
}) => {
    const transactions =
        account == null
            ? demoTransactions
            : demoTransactions.filter((item) => item.account === account.name);

    return (
        <div className="flex flex-col gap-3">
            {transactions.map((transaction) => (
                <Card
                    className="flex items-center gap-3 p-4 md:p-6"
                    key={`${transaction.account}-${transaction.title}`}
                >
                    <Icon
                        className="shrink-0 text-success-600"
                        icon={IconType.CHECKMARK}
                    />
                    <div className="flex min-w-0 grow flex-col">
                        <span className="truncate text-neutral-800">
                            {transaction.title}
                        </span>
                        <span className="truncate text-neutral-500 text-sm">
                            {transaction.account} · {transaction.age}
                        </span>
                    </div>
                    <span className="shrink-0 text-neutral-800">
                        {transaction.amount}
                    </span>
                </Card>
            ))}
        </div>
    );
};

const DemoSectionLink: React.FC<{ href: string }> = ({ href }) => {
    const { t } = useTranslations();

    return (
        <Button
            className="self-start"
            href={href}
            iconRight={IconType.CHEVRON_RIGHT}
            size="md"
            variant="tertiary"
        >
            {t('app.workspace.demo.action.viewAll')}
        </Button>
    );
};

const DemoWorkspacePage: React.FC<{ accountsOnly: boolean }> = ({
    accountsOnly,
}) => {
    const { t } = useTranslations();

    return (
        <Page.Container>
            <Page.Header
                avatar={
                    <DaoAvatar name={t('app.workspace.demo.name')} size="2xl" />
                }
                description={t('app.workspace.demo.description')}
                stats={[
                    {
                        label: t('app.workspace.demo.stat.accounts'),
                        value: demoAccounts.length,
                    },
                    {
                        label: t('app.workspace.demo.stat.treasury'),
                        value: '$560.27K',
                    },
                ]}
                title={t('app.workspace.demo.name')}
            />
            <Page.Content>
                <Page.Main className="max-w-4xl">
                    {!accountsOnly && (
                        <Page.MainSection
                            title={t(
                                'app.workspace.demo.section.latestActivity',
                            )}
                        >
                            <DemoTransactionList />
                        </Page.MainSection>
                    )}
                    <Page.MainSection
                        aria-label={t('app.workspace.demo.section.accounts')}
                        role="region"
                        title={t('app.workspace.demo.section.accounts')}
                    >
                        <div className="flex flex-col gap-3 md:gap-2">
                            {demoAccounts.map((account) => (
                                <DemoAccountItem
                                    account={account}
                                    key={account.id}
                                />
                            ))}
                        </div>
                    </Page.MainSection>
                </Page.Main>
            </Page.Content>
        </Page.Container>
    );
};

const DemoAccountPage: React.FC<{
    account: DemoAccount;
    section: DemoSection;
}> = ({ account, section }) => {
    const { t } = useTranslations();
    const isDao = account.type === 'dao';
    const isDashboard = section === 'dashboard';
    const baseUrl = `/demo/account/${account.id}`;

    const stats = isDao
        ? [
              {
                  label: t('app.workspace.demo.stat.proposals'),
                  value: 266,
              },
              { label: t('app.workspace.demo.stat.members'), value: 4 },
              {
                  label: t('app.workspace.demo.stat.treasury'),
                  value: '$560.27K',
              },
          ]
        : [
              {
                  label: t('app.workspace.demo.stat.threshold'),
                  value: account.threshold,
              },
              {
                  label: t('app.workspace.demo.stat.owners'),
                  value: account.owners,
              },
              { label: t('app.workspace.demo.stat.nonce'), value: 42 },
          ];

    const sectionContent: Partial<Record<DemoSection, ReactNode>> = {
        proposals: <DemoProposalList />,
        transactions: <DemoTransactionList account={account} />,
        assets: <DemoAssetList safe={!isDao} />,
        members: <DemoMemberList account={account} />,
    };

    const sectionTitles: Record<DemoSection, string> = {
        dashboard: account.name,
        proposals: t('app.workspace.demo.section.proposals'),
        transactions: t('app.workspace.demo.section.transactions'),
        assets: t('app.workspace.demo.section.assets'),
        members: t(
            isDao
                ? 'app.workspace.demo.section.members'
                : 'app.workspace.demo.section.owners',
        ),
    };

    return (
        <Page.Container>
            <Page.Header
                avatar={<DemoAccountAvatar account={account} size="2xl" />}
                description={account.description}
                stats={stats}
                title={account.name}
            />
            <Page.Content>
                <Page.Main>
                    {isDashboard ? (
                        <>
                            {isDao && (
                                <Page.MainSection
                                    title={t(
                                        'app.workspace.demo.section.proposals',
                                    )}
                                >
                                    <DemoProposalList />
                                    <DemoSectionLink
                                        href={`${baseUrl}/proposals`}
                                    />
                                </Page.MainSection>
                            )}
                            {!isDao && (
                                <Page.MainSection
                                    description={t(
                                        'app.workspace.demo.section.pendingDescription',
                                    )}
                                    title={t(
                                        'app.workspace.demo.section.pendingTransactions',
                                    )}
                                >
                                    <DemoTransactionList account={account} />
                                    <DemoSectionLink
                                        href={`${baseUrl}/transactions`}
                                    />
                                </Page.MainSection>
                            )}
                            <Page.MainSection
                                title={t(
                                    isDao
                                        ? 'app.workspace.demo.section.members'
                                        : 'app.workspace.demo.section.owners',
                                )}
                            >
                                <DemoMemberList account={account} />
                                <DemoSectionLink href={`${baseUrl}/members`} />
                            </Page.MainSection>
                            <Page.MainSection
                                title={t('app.workspace.demo.section.assets')}
                            >
                                <DemoAssetList safe={!isDao} />
                                <DemoSectionLink href={`${baseUrl}/assets`} />
                            </Page.MainSection>
                        </>
                    ) : (
                        <Page.MainSection title={sectionTitles[section]}>
                            {sectionContent[section]}
                        </Page.MainSection>
                    )}
                </Page.Main>
                {isDao && (
                    <Page.Aside>
                        <Page.AsideCard
                            title={t('app.workspace.demo.section.contract')}
                        >
                            <dl className="flex flex-col gap-4 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-neutral-500">
                                        {t('app.workspace.demo.contract.chain')}
                                    </dt>
                                    <dd>Ethereum</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-neutral-500">
                                        {t(
                                            'app.workspace.demo.contract.address',
                                        )}
                                    </dt>
                                    <dd>
                                        {addressUtils.truncateAddress(
                                            account.address,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-neutral-500">ENS</dt>
                                    <dd>eagleops.dao.eth</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-neutral-500">
                                        {t(
                                            'app.workspace.demo.contract.launched',
                                        )}
                                    </dt>
                                    <dd>March 2023</dd>
                                </div>
                            </dl>
                        </Page.AsideCard>
                    </Page.Aside>
                )}
            </Page.Content>
        </Page.Container>
    );
};

export const WorkspaceDemoPageClient: React.FC<
    IWorkspaceDemoPageClientProps
> = ({ path = [] }) => {
    const { t } = useTranslations();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const accountId = path[0] === 'account' ? path[1] : undefined;
    const account = demoAccounts.find(({ id }) => id === accountId);
    const section = (path[2] ?? 'dashboard') as DemoSection;
    const accountsOnly = path[0] === 'accounts';
    const navigationLinks = getNavigationLinks(account);

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
                        <DemoWorkspaceSelector />
                        <DemoAccountSelector
                            account={account}
                            section={section}
                        />
                    </>
                }
                links={navigationLinks}
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
                    links={navigationLinks}
                    onOpenChange={setDialogOpen}
                    open={isDialogOpen}
                >
                    <div className="flex flex-col gap-2 px-4">
                        <DemoWorkspaceSelector />
                        <DemoAccountSelector
                            account={account}
                            section={section}
                        />
                    </div>
                </Navigation.Dialog>
            </Navigation.Container>
        </>
    );

    return (
        <LayoutSidebar navigation={navigation}>
            {account == null ? (
                <DemoWorkspacePage accountsOnly={accountsOnly} />
            ) : (
                <DemoAccountPage account={account} section={section} />
            )}
        </LayoutSidebar>
    );
};
