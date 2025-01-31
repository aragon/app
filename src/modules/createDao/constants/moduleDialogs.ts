import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreateDaoDetailsDialog } from '../dialogs/createDaoDetailsDialog';
import { CreateProcessDetailsDialog } from '../dialogs/createProcessDetailsDialog';
import { PrepareProcessDialog } from '../dialogs/prepareProcessDialog';
import { PublishDaoDialog } from '../dialogs/publishDaoDialog';
import { PublishProcessDialog } from '../dialogs/publishProcessDialog';

export enum CreateDaoDialog {
    PUBLISH_DAO = ' PUBLISH_DAO',
    CREATE_DAO_DETAILS = 'CREATE_DAO_DETAILS',
    CREATE_PROCESS_DETAILS = 'CREATE_PROCESS_DETAILS',
    PREPARE_PROCESS = 'PREPARE_PROCESS',
    PUBLISH_PROCESS = 'PUBLISH_PROCESS',
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
        size: 'lg',
    },
    [CreateDaoDialog.CREATE_PROCESS_DETAILS]: {
        Component: CreateProcessDetailsDialog,
        title: 'app.createDao.createProcessDetailsDialog.title',
        description: 'app.createDao.createProcessDetailsDialog.description',
        size: 'lg',
    },
    [CreateDaoDialog.PREPARE_PROCESS]: {
        Component: PrepareProcessDialog,
        title: 'app.createDao.prepareProcessDialog.title',
        description: 'app.createDao.prepareProcessDialog.description',
    },
    [CreateDaoDialog.PUBLISH_PROCESS]: {
        Component: PublishProcessDialog,
        title: 'app.createDao.publishProcessDialog.title',
        description: 'app.createDao.publishProcessDialog.description',
    },
};
