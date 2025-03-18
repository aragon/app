import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, IconType, NumberFormat } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import type { ComponentProps } from 'react';
import AragonXHeader from '../../../../assets/images/aragon-x-header.jpg';
import { Container } from '../../container';
import { PageHeaderCustomStat } from './pageHeaderCustomStat';
export interface IPageHeaderCustomProps extends ComponentProps<'header'> {
    dao: IDao;
}

export const PageHeaderCustom: React.FC<IPageHeaderCustomProps> = (props) => {
    const { dao, className, ...otherProps } = props;

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

    //   TODO -
    //   - Add Guard for create proposal
    //   - Strings to locale
    //   - Rename file & move to new home

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
            <Container className="flex flex-col gap-6">
                <div className="flex w-full min-w-0 flex-row gap-10 md:gap-16 lg:gap-10 xl:gap-16">
                    <div className="flex w-full flex-col gap-y-10 pb-4 pt-10 md:py-16">
                        <div className="flex flex-col gap-y-3">
                            <h1 className="text-[56px] !text-neutral-0">{title}</h1>
                            <p className="text-neutral-0">{description}</p>
                        </div>
                        <div className="flex w-full flex-col-reverse md:flex-row md:items-center md:justify-between">
                            <Button
                                className="w-full md:max-w-fit"
                                iconLeft={IconType.PLUS}
                                href={`/dao/${daoId}/create/multisig/proposal`}
                            >
                                Create Proposal
                            </Button>
                            <div className="flex flex-row gap-6 py-4 lg:gap-10 xl:gap-16">
                                {stats.map((stat) => (
                                    <PageHeaderCustomStat key={stat.label} {...stat} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </header>
    );
};
