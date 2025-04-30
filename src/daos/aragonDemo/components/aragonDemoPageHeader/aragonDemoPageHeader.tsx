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
import AragonDemoHeader from '../../assets/header.jpg';
import { AragonDemoPageHeaderStat } from './aragonDemoPageHeaderStat';

export interface IAragonDemoPageHeaderProps extends ComponentProps<'header'> {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const AragonDemoPageHeader: React.FC<IAragonDemoPageHeaderProps> = (props) => {
    const { dao, className, ...otherProps } = props;

    const router = useRouter();
    const { t } = useTranslations();

    const { name: title, description, id: daoId, metrics } = dao;

    const proposalsCreated = formatterUtils.formatNumber(metrics.proposalsCreated, {
        format: NumberFormat.GENERIC_SHORT,
    });

    const daoTvl = formatterUtils.formatNumber(metrics.tvlUSD, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const stats = [
        { value: proposalsCreated, label: t('app.daos.aragonDemo.aragonDemoPageHeader.stat.proposals') },
        { value: daoTvl, label: t('app.daos.aragonDemo.aragonDemoPageHeader.stat.treasury'), suffix: 'USD' },
    ];

    const plugin = useDaoPlugins({ daoId })![0];

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
                src={AragonDemoHeader}
                alt="Aragon Demo Header"
                className="absolute left-0 top-0 -z-10 size-full object-cover"
            />
            <Container className="flex w-full flex-col gap-6 pb-4 pt-10 md:gap-y-10 md:py-16">
                <div className="flex flex-col gap-y-2 md:gap-y-3">
                    <h1 className="text-3xl font-normal leading-tight text-neutral-0 md:text-5xl">{title}</h1>
                    <p className="max-w-screen-md text-base font-normal leading-normal text-neutral-0 md:text-xl">
                        {description}
                    </p>
                </div>
                <div className="flex w-full flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
                    <Button className="w-full md:max-w-fit" iconLeft={IconType.PLUS} onClick={handleCtaClick}>
                        {t(`app.daos.aragonDemo.aragonDemoPageHeader.cta`)}
                    </Button>
                    <div className="flex flex-row gap-10 md:gap-12">
                        {stats.map((stat) => (
                            <AragonDemoPageHeaderStat key={stat.label} {...stat} />
                        ))}
                    </div>
                </div>
            </Container>
        </header>
    );
};
