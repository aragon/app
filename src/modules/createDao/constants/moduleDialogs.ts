import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { PublishDaoDialog } from '../dialogs/publishDaoDialog';

export enum CreateDaoDialog {
    PUBLISH_DAO = ' PUBLISH_DAO',
}

export const createDaoDialogs: Record<CreateDaoDialog, IDialogComponentDefinitions> = {
    [CreateDaoDialog.PUBLISH_DAO]: {
        Component: PublishDaoDialog,
        title: 'app.createDao.publishDaoDialog.title',
        description: 'app.createDao.publishDaoDialog.description',
    },
};
