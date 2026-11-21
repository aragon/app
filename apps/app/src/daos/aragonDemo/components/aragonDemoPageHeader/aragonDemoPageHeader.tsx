'use client';

import {
    Button,
    formatterUtils,
    IconType,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { useDaoProposalsCount } from '@/modules/governance/hooks/useDaoProposalsCount';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils, type IDaoPageHeaderProps } from '@/shared/utils/daoUtils';
import AragonDemoHeader from '../../assets/aragonDemoHeader.jpg';
import { AragonDemoPageHeaderStat } from './aragonDemoPageHeaderStat';

export interface IAragonDemoPageHeaderProps extends IDaoPageHeaderProps {}

export const AragonDemoPageHeader: React.FC<IAragonDemoPageHeaderProps> = (
    props,
) => {
    const { dao, className, ...otherProps } = props;

    const router = useRouter();
    const { t } = useTranslations();

    const { name: title, description, id: daoId, metrics } = dao;

    const proposalsCreated = useDaoProposalsCount({ daoId });

    const daoTvl = formatterUtils.formatNumber(metrics.tvlUSD, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
    });

    const stats = [
        {
            value: proposalsCreated,
            label: t('app.daos.aragonDemo.aragonDemoPageHeader.stat.proposals'),
        },
        {
            value: daoTvl,
            label: t('app.daos.aragonDemo.aragonDemoPageHeader.stat.treasury'),
            suffix: 'USD',
        },
    ];

    const plugin = useDaoPlugins({ daoId })![0];

    const createProposalUrl = daoUtils.getDaoUrl(
        dao,
        `create/${plugin.meta.address}/proposal`,
    )!;

    const { check: createProposalGuard, result: canCreateProposal } =
        usePermissionCheckGuard({
            permissionNamespace: 'proposal',
            slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
            onSuccess: () => router.push(createProposalUrl),
            plugin: plugin.meta,
            daoId,
        });

    const handleCtaClick = () =>
        canCreateProposal
            ? router.push(createProposalUrl)
            : createProposalGuard();

    return (
        <header
            className={classNames(
                'relative flex h-fit flex-col items-center justify-center md:h-[400px]',
                className,
            )}
            {...otherProps}
        >
            <Image
                alt="Aragon Demo Header"
                className="absolute top-0 left-0 -z-10 size-full object-cover"
                src={AragonDemoHeader}
            />
            <Container className="flex w-full flex-col gap-6 pt-10 pb-4 md:gap-y-10 md:py-16">
                <div className="flex flex-col gap-y-related--8-12">
                    <h1 className="text-3xl leading-tight font-normal text-neutral-0 md:text-5xl">
                        {title}
                    </h1>
                    <p className="max-w-screen-md text-base leading-normal font-normal text-neutral-0 md:text-xl">
                        {description}
                    </p>
                </div>
                <div className="flex w-full flex-col-reverse gap-section md:flex-row md:items-center md:justify-between">
                    <Button
                        className="w-full md:max-w-fit"
                        iconLeft={IconType.PLUS}
                        onClick={handleCtaClick}
                    >
                        {t('app.daos.aragonDemo.aragonDemoPageHeader.cta')}
                    </Button>
                    <div className="flex flex-row gap-section-wide--40-48">
                        {stats.map((stat) => (
                            <AragonDemoPageHeaderStat
                                key={stat.label}
                                {...stat}
                            />
                        ))}
                    </div>
                </div>
            </Container>
        </header>
    );
};
