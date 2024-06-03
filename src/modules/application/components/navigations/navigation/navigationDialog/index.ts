import dynamic from 'next/dynamic';

export const NavigationDialog = dynamic(() => import('./navigationDialog').then((module) => module.NavigationDialog));
export { type INavigationDialogProps } from './navigationDialog';
