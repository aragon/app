import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreateDaoDetailsDialog } from '../dialogs/createDaoDetailsDialog';
import { CreateProcessDetailsDialog } from '../dialogs/createProcessDetailsDialog';
import { PrepareProcessDialog } from '../dialogs/prepareProcessDialog';
import { PublishDaoDialog } from '../dialogs/publishDaoDialog';
import { PublishProcessDialog } from '../dialogs/publishProcessDialog';
import { SetupBodyDialog } from '../dialogs/setupBodyDialog';
import { SetupStageTimingDialog } from '../dialogs/setupStageTimingDialog';
import { CreateDaoDialogId } from './createDaoDialogId';

export const createDaoDialogsDefinitions: Record<CreateDaoDialogId, IDialogComponentDefinitions> = {
    [CreateDaoDialogId.PUBLISH_DAO]: { Component: PublishDaoDialog },
    [CreateDaoDialogId.CREATE_DAO_DETAILS]: { Component: CreateDaoDetailsDialog, size: 'lg' },
    [CreateDaoDialogId.CREATE_PROCESS_DETAILS]: { Component: CreateProcessDetailsDialog, size: 'lg' },
    [CreateDaoDialogId.PREPARE_PROCESS]: { Component: PrepareProcessDialog },
    [CreateDaoDialogId.PUBLISH_PROCESS]: { Component: PublishProcessDialog },
    [CreateDaoDialogId.SETUP_BODY]: {
        Component: SetupBodyDialog,
        size: 'lg',
        hiddenDescription: 'app.createDao.setupBodyDialog.a11y.description',
    },
    [CreateDaoDialogId.SETUP_STAGE_TIMING]: {
        Component: SetupStageTimingDialog,
        size: 'lg',
        hiddenDescription: 'app.createDao.setupStageTimingDialog.a11y.description',
    },
};
