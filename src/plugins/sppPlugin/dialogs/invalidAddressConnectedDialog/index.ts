import dynamic from 'next/dynamic';

export const InvalidAddressConnectedDialog = dynamic(() =>
    import('./invalidAddressConnectedDialog').then((mod) => mod.InvalidAddressConnectedDialog),
);

export type {
    IInvalidAddressConnectedDialogParams,
    IInvalidAddressConnectedDialogProps,
} from './invalidAddressConnectedDialog';
