import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import type { IDao } from '@/shared/api/daoService';
import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button, formatterUtils, IconType, NumberFormat } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';
import AragonXHeader from '../../../../assets/images/aragon-x-header.jpg';
import { PageHeaderStat } from './pageHeaderStat';

export interface IPageHeaderProps extends ComponentProps<'header'> {
    dao: IDao;
}

export const PageHeader: React.FC<IPageHeaderProps> = (props) => {
    const { dao, className, ...otherProps } = props;

    const router = useRouter();

    const { t } = useTranslations();

    const title = dao.name;
    const description = dao.description;
    const daoId = dao.id;

    const proposalsCreated = formatterUtils.formatNumber(dao.metrics.proposalsCreated, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const daoTvl = formatterUtils.formatNumber(dao.metrics.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const stats = [
        { value: proposalsCreated, label: t('app.dashboard.daoDashboardPage.header.stat.proposals') },
        { value: daoTvl, label: t('app.dashboard.daoDashboardPage.header.stat.treasury'), suffix: 'USD' },
    ];

    const plugin = useDaoPlugins({ daoId, subdomain: 'multisig' })![0];

    const createProposalUrl: __next_route_internal_types__.DynamicRoutes = `/dao/${daoId}/create/${plugin.meta.address}/proposal`;

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: () => router.push(createProposalUrl),
        plugin: plugin.meta,
        daoId,
    });

    const handleCtaClick = () => (canCreateProposal ? router.push(createProposalUrl) : createProposalGuard());

    return (
        <header
            className={classNames('relative flex h-fit flex-col items-center justify-center md:h-[400px]', className)}
            {...otherProps}
        >
            <Image
                src={AragonXHeader}
                alt="Aragon X Header"
                className="absolute left-0 top-0 -z-10 size-full object-cover"
            />
            <Container className="flex w-full flex-col gap-6">
                <div className="flex min-w-0 flex-row gap-10 md:gap-16 lg:gap-10 xl:gap-16">
                    <div className="flex w-full flex-col gap-y-6 pb-4 pt-10 md:gap-y-10 md:py-16">
                        <div className="flex flex-col gap-y-2 md:gap-y-3">
                            <h1 className="text-3xl font-normal leading-tight text-neutral-0 md:text-5xl">{title}</h1>
                            <p className="max-w-screen-md text-base font-normal leading-normal text-neutral-0 md:text-xl">
                                {description}
                            </p>
                        </div>
                        <div className="flex w-full flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
                            <Button className="w-full md:max-w-fit" iconLeft={IconType.PLUS} onClick={handleCtaClick}>
                                {t(`app.daos.aragonX.components.pageHeader.cta`)}
                            </Button>
                            <div className="flex flex-row gap-10 md:gap-12">
                                {stats.map((stat) => (
                                    <PageHeaderStat key={stat.label} {...stat} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </header>
    );
};
