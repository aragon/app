import dynamic from 'next/dynamic';
import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { CreateDaoDialogId } from './createDaoDialogId';

export const createDaoDialogsDefinitions: Record<
    CreateDaoDialogId,
    IDialogComponentDefinitions
> = {
    [CreateDaoDialogId.PUBLISH_DAO]: {
        Component: dynamic(() =>
            import('../dialogs/publishDaoDialog').then(
                (m) => m.PublishDaoDialog,
            ),
        ),
    },
    [CreateDaoDialogId.CREATE_DAO_DETAILS]: {
        Component: dynamic(() =>
            import('../dialogs/createDaoDetailsDialog').then(
                (m) => m.CreateDaoDetailsDialog,
            ),
        ),
        size: 'lg',
    },
    [CreateDaoDialogId.CREATE_PROCESS_DETAILS]: {
        Component: dynamic(() =>
            import('../dialogs/createProcessDetailsDialog').then(
                (m) => m.CreateProcessDetailsDialog,
            ),
        ),
        size: 'lg',
    },
    [CreateDaoDialogId.PREPARE_PROCESS]: {
        Component: dynamic(() =>
            import('../dialogs/prepareProcessDialog').then(
                (m) => m.PrepareProcessDialog,
            ),
        ),
    },
    [CreateDaoDialogId.SETUP_BODY]: {
        Component: dynamic(() =>
            import('../dialogs/setupBodyDialog').then((m) => m.SetupBodyDialog),
        ),
        size: 'lg',
        hiddenDescription: 'app.createDao.setupBodyDialog.a11y.description',
    },
    [CreateDaoDialogId.SETUP_STAGE_SETTINGS]: {
        Component: dynamic(() =>
            import('../dialogs/setupStageSettingsDialog').then(
                (m) => m.SetupStageSettingsDialog,
            ),
        ),
        size: 'lg',
        hiddenDescription:
            'app.createDao.setupStageSettingsDialog.a11y.description',
    },
};
