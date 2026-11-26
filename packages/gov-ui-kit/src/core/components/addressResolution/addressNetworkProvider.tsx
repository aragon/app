import { createContext, type ReactNode } from 'react';

export const AddressNetworkContext = createContext<number | undefined>(undefined);

export interface IAddressNetworkProviderProps {
    /**
     * Network of the addresses below, the nearest provider wins. Names saved for one network show only on that network.
     */
    chainId?: number;
    children: ReactNode;
}

export const AddressNetworkProvider: React.FC<IAddressNetworkProviderProps> = (props) => {
    const { chainId, children } = props;

    return <AddressNetworkContext.Provider value={chainId}>{children}</AddressNetworkContext.Provider>;
};
