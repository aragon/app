import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreateDaoDetailsDialog } from '../dialogs/createDaoDetailsDialog';
import { CreateProcessDetailsDialog } from '../dialogs/createProcessDetailsDialog';
import { PrepareProcessDialog } from '../dialogs/prepareProcessDialog';
import { PublishDaoDialog } from '../dialogs/publishDaoDialog';
import { PublishProcessDialog } from '../dialogs/publishProcessDialog';
import { SetupBodyDialog } from '../dialogs/setupBodyDialog';
import { SetupStageTimingDialog } from '../dialogs/setupStageTimingDialog';
import { CreateDaoDialog } from './createDaoDialogId';

export const createDaoDialogs: Record<CreateDaoDialog, IDialogComponentDefinitions> = {
    [CreateDaoDialog.PUBLISH_DAO]: { Component: PublishDaoDialog },
    [CreateDaoDialog.CREATE_DAO_DETAILS]: { Component: CreateDaoDetailsDialog, size: 'lg' },
    [CreateDaoDialog.CREATE_PROCESS_DETAILS]: { Component: CreateProcessDetailsDialog, size: 'lg' },
    [CreateDaoDialog.PREPARE_PROCESS]: { Component: PrepareProcessDialog },
    [CreateDaoDialog.PUBLISH_PROCESS]: { Component: PublishProcessDialog },
    [CreateDaoDialog.SETUP_BODY]: {
        Component: SetupBodyDialog,
        size: 'lg',
        hiddenDescription: 'app.createDao.setupBodyDialog.a11y.description',
    },
    [CreateDaoDialog.SETUP_STAGE_TIMING]: {
        Component: SetupStageTimingDialog,
        size: 'lg',
        hiddenDescription: 'app.createDao.setupStageTimingDialog.a11y.description',
    },
};
