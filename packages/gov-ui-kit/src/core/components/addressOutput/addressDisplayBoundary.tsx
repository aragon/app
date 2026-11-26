import { createContext, type ReactNode } from 'react';

export const AddressDisplayBoundaryContext = createContext<boolean>(false);

export interface IAddressDisplayBoundaryProps {
    children: ReactNode;
}

/**
 * Marks a decision surface, where the user approves or signs something. Every `AddressOutput` below it shows the name
 * and the full address together, with no popover and no edit button, and no `href` link (the address is the thing to read). Nothing turns it off from the inside.
 */
export const AddressDisplayBoundary: React.FC<IAddressDisplayBoundaryProps> = (props) => (
    <AddressDisplayBoundaryContext.Provider value={true}>{props.children}</AddressDisplayBoundaryContext.Provider>
);
