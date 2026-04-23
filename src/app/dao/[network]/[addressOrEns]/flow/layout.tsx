import type { ReactNode } from 'react';
import { FlowLayout } from '@/modules/flow';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';

export interface IFlowLayoutRouteProps {
    children?: ReactNode;
    params: Promise<IDaoPageParams>;
}

const FlowLayoutRoute = async (props: IFlowLayoutRouteProps) => {
    const { params, children } = props;
    const { network, addressOrEns } = await params;

    if (!networkUtils.isValidNetwork(network)) {
        return <>{children}</>;
    }

    const daoId = await daoUtils.resolveDaoId({ network, addressOrEns });

    return (
        <FlowLayout addressOrEns={addressOrEns} daoId={daoId} network={network}>
            {children}
        </FlowLayout>
    );
};

export default FlowLayoutRoute;
