import dynamic from 'next/dynamic';

export const PublishDaoDialog = dynamic(() => import('./publishDaoDialog').then((mod) => mod.PublishDaoDialog));
export type { IPublishDaoDialogParams, IPublishDaoDialogProps } from './publishDaoDialog';
