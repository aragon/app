import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getEnsAddress } from 'wagmi/actions';

import { BannerDao } from '../../bannerDao';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationDao } from '../../navigations/navigationDao';

export interface ILayoutDaoProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
    /**
     * URL parameters of the layout.
     */
    params: Promise<IDaoPageParams>;
}

export const LayoutDao: React.FC<ILayoutDaoProps> = async (props) => {
    const { params, children } = props;
    const { id, network } = await params;
    // const daoId = await resolveDaoId(id, network);

    const queryClient = new QueryClient();

    let daoId: string;

    if (id.endsWith('.eth')) {
        console.log('wagmiConfig', id);
        const ensAddress = await getEnsAddress(wagmiConfig, {
            name: id,
            chainId: 1,
        });

        if (!ensAddress) {
            throw new Error('ENS address not found');
        }

        daoId = `${network}-${ensAddress}`;
    } else {
        daoId = `${network}-${id}`;
    }

    try {
        const daoUrlParams = { id: daoId };
        await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error)) as unknown}
                actionLink="/"
                notFoundNamespace="app.application.layoutDao"
            />
        );
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NavigationDao id={daoId} />
            <BannerDao id={daoId} />
            <ErrorBoundary>{children}</ErrorBoundary>
        </HydrationBoundary>
    );
};
