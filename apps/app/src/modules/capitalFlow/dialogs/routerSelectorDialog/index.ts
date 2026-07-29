import dynamic from 'next/dynamic';

export const RouterSelectorDialog = dynamic(() =>
    import('./routerSelectorDialog').then((mod) => mod.RouterSelectorDialog),
);

export type {
    IRouterSelectorDialogParams,
    IRouterSelectorDialogProps,
} from './routerSelectorDialog';
