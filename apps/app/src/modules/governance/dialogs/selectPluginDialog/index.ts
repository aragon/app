import dynamic from 'next/dynamic';

export const SelectPluginDialog = dynamic(() =>
    import('./selectPluginDialog').then((mod) => mod.SelectPluginDialog),
);
export type {
    ISelectPluginDialogParams,
    ISelectPluginDialogProps,
} from './selectPluginDialog';
export {
    type ISelectPluginDialogProcessListItemProps,
    SelectPluginDialogProcessListItem,
} from './selectPluginDialogProcessListItem';
