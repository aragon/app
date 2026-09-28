import dynamic from 'next/dynamic';

export const CrossChainControllerForwardMessageAction = dynamic(() =>
    import('./crossChainControllerForwardMessageAction').then(
        (mod) => mod.CrossChainControllerForwardMessageAction,
    ),
);

export type { ICrossChainControllerForwardMessageActionProps } from './crossChainControllerForwardMessageAction';
