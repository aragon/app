import type { ReactNode } from 'react';
import { FlowDataProvider } from '../../providers/flowDataProvider';
import { FlowSubNav } from '../flowSubNav/flowSubNav';
import { FlowToastStack } from '../flowToastStack/flowToastStack';
import { FlowTopbar } from '../flowTopbar/flowTopbar';

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
            <div className="flex min-h-screen flex-col bg-neutral-50">
                <FlowTopbar
                    addressOrEns={addressOrEns}
                    daoId={daoId}
                    network={network}
                />
                <FlowSubNav addressOrEns={addressOrEns} network={network} />
                <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
                    {children}
                </main>
                <FlowToastStack />
            </div>
        </FlowDataProvider>
    );
};
