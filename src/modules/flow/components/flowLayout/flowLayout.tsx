import type { ReactNode } from 'react';
import { FlowDataProvider } from '../../providers/flowDataProvider';
import { FlowLayoutShell } from './flowLayoutShell';

export interface IFlowLayoutProps {
    daoId: string;
    network: string;
    addressOrEns: string;
    children?: ReactNode;
}

export const FlowLayout: React.FC<IFlowLayoutProps> = (props) => {
    const { daoId, network, addressOrEns, children } = props;

    return (
        <FlowDataProvider
            addressOrEns={addressOrEns}
            daoId={daoId}
            network={network}
        >
            <FlowLayoutShell
                addressOrEns={addressOrEns}
                daoId={daoId}
                network={network}
            >
                {children}
            </FlowLayoutShell>
        </FlowDataProvider>
    );
};
