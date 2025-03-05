import { type ICompositeAddress, invariant } from '@aragon/gov-ui-kit';
import { createContext, useContext } from 'react';

export interface IAddressesInputContext {
    /**
     * The field name for the form.
     */
    fieldName: string;

    /**
     * Function to remove a member from the list.
     */
    onRemoveMember: (index: number) => void;
    /**
     * Function to check if an address is already in the list.
     */
    checkIsAlreadyInList: (index: number) => boolean;
    /**
     * Flag to determine if zero members are allowed in the list.
     */
    allowZeroMembers?: boolean;
    /**
     * The members array.
     */
    membersField: ICompositeAddress[];
    /**
     * Function to add a new member.
     */
    addMember: () => void;
}

export const addressesInputContext = createContext<IAddressesInputContext | null>(null);

export const AddressesInputContextProvider = addressesInputContext.Provider;

export const useAddressesInputContext = (): IAddressesInputContext => {
    const values = useContext(addressesInputContext);

    invariant(values !== null, 'useAddressesInputContext: the hook must be used within AddressesInputContextProvider');

    return values;
};
