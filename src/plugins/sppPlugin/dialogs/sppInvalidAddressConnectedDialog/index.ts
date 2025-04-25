import dynamic from 'next/dynamic';

export const SppInvalidAddressConnectedDialog = dynamic(() =>
    import('./sppInvalidAddressConnectedDialog').then((mod) => mod.SppInvalidAddressConnectedDialog),
);

export type {
    ISppInvalidAddressConnectedDialogParams,
    ISppInvalidAddressConnectedDialogProps,
} from './sppInvalidAddressConnectedDialog';
