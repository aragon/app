import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreateDaoDetailsDialog } from '../dialogs/createDaoDetailsDialog';
import { PublishDaoDialog } from '../dialogs/publishDaoDialog';

export enum CreateDaoDialog {
    PUBLISH_DAO = ' PUBLISH_DAO',
    CREATE_DAO_DETAILS = 'CREATE_DAO_DETAILS',
}

export const createDaoDialogs: Record<CreateDaoDialog, IDialogComponentDefinitions> = {
    [CreateDaoDialog.PUBLISH_DAO]: {
        Component: PublishDaoDialog,
        title: 'app.createDao.publishDaoDialog.title',
        description: 'app.createDao.publishDaoDialog.description',
    },
    [CreateDaoDialog.CREATE_DAO_DETAILS]: {
        Component: CreateDaoDetailsDialog,
        title: 'app.createDao.createDaoDetailsDialog.title',
        description: 'app.createDao.createDaoDetailsDialog.description',
    },
};
