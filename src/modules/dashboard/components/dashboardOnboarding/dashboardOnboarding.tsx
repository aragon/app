'use client';

import {
    addressUtils,
    Button,
    Card,
    EmptyState,
    Heading,
    IconType,
    IllustrationObject,
    type IllustrationObjectType,
    invariant,
    Tag,
} from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useConnection } from 'wagmi';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '@/modules/createDao/dialogs/createProcessDetailsDialog';
import { useEnsName } from '@/modules/ens';
import { daoMembersPageFilterParam } from '@/modules/governance/pages/daoMembersPage';
import type { IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useAdminStatus } from '@/shared/hooks/useAdminStatus';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IDashboardOnboardingProps {
    /**
     * The DAO data.
     */
    dao: IDao;
}

export const DashboardOnboarding: React.FC<IDashboardOnboardingProps> = (
    props,
) => {
    const { dao } = props;

    const { open } = useDialogContext();
    const { address } = useConnection();
    const { data: ensName } = useEnsName(address);

    const { isAdminMember, adminPlugin } = useAdminStatus({
        daoId: dao.id,
        network: dao.network,
    });

    const displayName =
        ensName ?? (address ? addressUtils.truncateAddress(address) : null);

    const daoUrl = daoUtils.getDaoUrl(dao)!;

    const handleAddGovernance = () => {
        invariant(
            adminPlugin != null,
            'DashboardOnboarding: admin plugin is expected.',
        );
        const params: ICreateProcessDetailsDialogParams = {
            daoUrl,
            pluginAddress: adminPlugin.address as Hex,
        };
        open(CreateDaoDialogId.CREATE_PROCESS_DETAILS, { params });
    };

    if (isAdminMember) {
        return (
            <AdminOnboarding
                displayName={displayName}
                onAddGovernance={handleAddGovernance}
            />
        );
    }

    const viewAdminsHref = `${daoUrl}/members?${daoMembersPageFilterParam}=${adminPlugin?.slug ?? ''}`;

    return (
        <NonAdminOnboarding
            displayName={displayName}
            viewAdminsHref={viewAdminsHref}
        />
    );
};

interface IAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS or truncated address).
     */
    displayName: string | null;
    /**
     * Callback to open the governance designer dialog.
     */
    onAddGovernance: () => void;
}

const AdminOnboarding: React.FC<IAdminOnboardingProps> = (props) => {
    const { displayName, onAddGovernance } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <Heading size="h1">
                    {t('app.dashboard.dashboardOnboarding.admin.welcome')}{' '}
                    {displayName != null && (
                        <span className="text-primary-400">{displayName}</span>
                    )}
                    <br />
                    {t('app.dashboard.dashboardOnboarding.admin.subtitle')}
                </Heading>
                <p className="text-lg text-neutral-500">
                    {t('app.dashboard.dashboardOnboarding.admin.description')}
                </p>
            </div>
            <div className="flex flex-col gap-4">
                <OnboardingCard
                    actionHref="https://www.aragon.org/get-assistance-form"
                    actionLabel={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.action',
                    )}
                    description={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.description',
                    )}
                    isPrimary={true}
                    object="USERS"
                    tag={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.tag',
                    )}
                    title={t(
                        'app.dashboard.dashboardOnboarding.admin.enterprise.title',
                    )}
                />
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-neutral-100" />
                    <span className="text-neutral-300 text-sm">
                        {t('app.dashboard.dashboardOnboarding.admin.divider')}
                    </span>
                    <div className="h-px flex-1 bg-neutral-100" />
                </div>
                <OnboardingCard
                    actionLabel={t(
                        'app.dashboard.dashboardOnboarding.admin.free.addGovernance',
                    )}
                    actionOnClick={onAddGovernance}
                    description={t(
                        'app.dashboard.dashboardOnboarding.admin.free.description',
                    )}
                    isPrimary={false}
                    object="SMART_CONTRACT"
                    secondaryActionHref="https://docs.aragon.org"
                    secondaryActionLabel={t(
                        'app.dashboard.dashboardOnboarding.admin.free.viewDocs',
                    )}
                    title={t(
                        'app.dashboard.dashboardOnboarding.admin.free.title',
                    )}
                />
            </div>
        </div>
    );
};

interface INonAdminOnboardingProps {
    /**
     * Display name of the connected user (ENS or truncated address).
     */
    displayName: string | null;
    /**
     * URL to the admin members page.
     */
    viewAdminsHref: string;
}

const NonAdminOnboarding: React.FC<INonAdminOnboardingProps> = (props) => {
    const { displayName, viewAdminsHref } = props;

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-6">
            <Heading size="h1">
                {t('app.dashboard.dashboardOnboarding.nonAdmin.welcome')}{' '}
                {displayName != null && (
                    <span className="text-primary-400">{displayName}</span>
                )}
            </Heading>
            <EmptyState
                description={t(
                    'app.dashboard.dashboardOnboarding.nonAdmin.description',
                )}
                heading={t('app.dashboard.dashboardOnboarding.nonAdmin.title')}
                humanIllustration={{
                    body: 'ELEVATING',
                    hairs: 'SHORT',
                    accessory: 'PIERCINGS_TATTOO',
                    sunglasses: 'LARGE_STYLIZED',
                    expression: 'SMILE_WINK',
                }}
                secondaryButton={{
                    label: t(
                        'app.dashboard.dashboardOnboarding.nonAdmin.viewAdmins',
                    ),
                    href: viewAdminsHref,
                }}
            />
        </div>
    );
};

interface IOnboardingCardProps {
    /**
     * Illustration object to render in the card header.
     */
    object: IllustrationObjectType;
    /**
     * Title of the card.
     */
    title: string;
    /**
     * Description of the card.
     */
    description: string;
    /**
     * Whether the primary action button is a primary variant.
     */
    isPrimary: boolean;
    /**
     * Label for the primary action button.
     */
    actionLabel: string;
    /**
     * URL for the primary action button (opens external link).
     */
    actionHref?: string;
    /**
     * Callback for the primary action button.
     */
    actionOnClick?: () => void;
    /**
     * Optional tag label displayed in the top-right corner.
     */
    tag?: string;
    /**
     * Label for the secondary action button.
     */
    secondaryActionLabel?: string;
    /**
     * URL for the secondary action button (opens external link).
     */
    secondaryActionHref?: string;
}

const OnboardingCard: React.FC<IOnboardingCardProps> = (props) => {
    const {
        object,
        title,
        description,
        isPrimary,
        actionLabel,
        actionHref,
        actionOnClick,
        tag,
        secondaryActionLabel,
        secondaryActionHref,
    } = props;

    const isExternal = actionHref != null;
    const borderClass = isPrimary ? 'border-primary-200' : 'border-neutral-100';

    return (
        <Card
            className={`relative flex flex-col gap-6 border p-6 ${borderClass}`}
        >
            {tag != null && (
                <Tag
                    className="absolute top-6 right-6"
                    label={tag}
                    variant="primary"
                />
            )}
            <IllustrationObject
                className="size-24 rounded-full bg-neutral-50"
                object={object}
            />
            <div className="flex flex-col gap-3">
                <Heading as="h2" size="h1">
                    {title}
                </Heading>
                <p className="text-lg text-neutral-500 leading-normal">
                    {description}
                </p>
            </div>
            <div className="flex gap-3">
                <Button
                    href={actionHref}
                    iconRight={isExternal ? IconType.LINK_EXTERNAL : undefined}
                    onClick={actionOnClick}
                    size="md"
                    target={isExternal ? '_blank' : undefined}
                    variant={isPrimary ? 'primary' : 'secondary'}
                >
                    {actionLabel}
                </Button>
                {secondaryActionLabel != null && (
                    <Button
                        href={secondaryActionHref}
                        iconRight={IconType.LINK_EXTERNAL}
                        size="md"
                        target="_blank"
                        variant="tertiary"
                    >
                        {secondaryActionLabel}
                    </Button>
                )}
            </div>
        </Card>
    );
};
