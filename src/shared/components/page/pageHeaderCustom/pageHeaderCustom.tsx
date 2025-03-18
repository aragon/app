import { Button, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import type { ComponentProps } from 'react';
import AragonXHeader from '../../../../assets/images/aragon-x-header.jpg';
import { Container } from '../../container';
import { PageHeaderCustomStat, type IPageHeaderCustomStat } from './pageHeaderCustomStat';
export interface IPageHeaderCustomProps extends ComponentProps<'header'> {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * ID of the plugin.
     */
    pluginId: string;
    /**
     * Title of the page.
     */
    title?: string;
    /**
     * Description of the page.
     */
    description?: string;
    /**
     * Statistics displayed on the header.
     */
    stats?: IPageHeaderCustomStat[];
}

export const PageHeaderCustom: React.FC<IPageHeaderCustomProps> = (props) => {
    const { daoId, pluginId, title, description, stats, className, ...otherProps } = props;

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
                                href={`/dao/${daoId}/create/${pluginId}/proposal`}
                            >
                                Create Proposal
                            </Button>
                            {stats != null && stats.length > 0 && (
                                <div className="flex flex-row gap-6 py-4 lg:gap-10 xl:gap-16">
                                    {stats.map((stat) => (
                                        <PageHeaderCustomStat key={stat.label} {...stat} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </header>
    );
};
