import { invariant } from '@aragon/gov-ui-kit';
import { createContext, useContext } from 'react';

export interface IAddressesInputContext {
    /**
     * The field name for the form.
     */
    fieldName: string;
    /**
     * Callback to remove a member from the list.
     */
    onRemoveMember: (index: number) => void;
}

const addressesInputContext = createContext<IAddressesInputContext | null>(null);

export const AddressesInputContextProvider = addressesInputContext.Provider;

export const useAddressesInputContext = (): IAddressesInputContext => {
    const values = useContext(addressesInputContext);

    invariant(values !== null, 'useAddressesInputContext: the hook must be used within AddressesInputContextProvider');

    return values;
};
