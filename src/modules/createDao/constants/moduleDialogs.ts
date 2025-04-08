import { type IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreateDaoDetailsDialog } from '../dialogs/createDaoDetailsDialog';
import { CreateProcessDetailsDialog } from '../dialogs/createProcessDetailsDialog';
import { GovernanceStageTimingFieldDialog } from '../dialogs/governanceStageTimingFieldDialog';
import { PrepareProcessDialog } from '../dialogs/prepareProcessDialog';
import { PublishDaoDialog } from '../dialogs/publishDaoDialog';
import { PublishProcessDialog } from '../dialogs/publishProcessDialog';
import { SetupBodyDialog } from '../dialogs/setupBodyDialog';
import { CreateDaoDialog, CreateProcessDialog } from './moduleDialogTypes';

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
};

export const createProcessDialogs: Record<CreateProcessDialog, IDialogComponentDefinitions> = {
    [CreateProcessDialog.STAGE_TIMING]: {
        Component: GovernanceStageTimingFieldDialog,
        size: 'lg',
        hiddenDescription: 'app.createDao.createProcessForm.governance.stageTimingField.dialog.a11y.description',
    },
};
