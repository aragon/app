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
    [CreateDaoDialog.PUBLISH_DAO]: { Component: PublishDaoDialog },
    [CreateDaoDialog.CREATE_DAO_DETAILS]: { Component: CreateDaoDetailsDialog, size: 'lg' },
    [CreateDaoDialog.CREATE_PROCESS_DETAILS]: { Component: CreateProcessDetailsDialog, size: 'lg' },
    [CreateDaoDialog.PREPARE_PROCESS]: { Component: PrepareProcessDialog },
    [CreateDaoDialog.PUBLISH_PROCESS]: { Component: PublishProcessDialog },
};
