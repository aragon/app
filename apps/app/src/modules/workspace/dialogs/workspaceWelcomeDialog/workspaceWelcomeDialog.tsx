'use client';

import { AvatarIcon, Dialog, IconType } from '@aragon/gov-ui-kit';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { workspaceWelcomeUtils } from '../../utils/workspaceWelcomeUtils';

export interface IWorkspaceWelcomeDialogProps extends IDialogComponentProps {}

const features: { icon: IconType; titleKey: string; descriptionKey: string }[] =
    [
        {
            icon: IconType.PEN,
            titleKey:
                'app.workspace.workspaceWelcomeDialog.feature.waiting.title',
            descriptionKey:
                'app.workspace.workspaceWelcomeDialog.feature.waiting.description',
        },
        {
            icon: IconType.CLOCK,
            titleKey:
                'app.workspace.workspaceWelcomeDialog.feature.track.title',
            descriptionKey:
                'app.workspace.workspaceWelcomeDialog.feature.track.description',
        },
    ];

/**
 * Greets the user as they enter the workspace they just created, once per creation (see `workspaceWelcomeUtils`),
 * never for a workspace they return to.
 */
export const WorkspaceWelcomeDialog: React.FC<IWorkspaceWelcomeDialogProps> = (
    props,
) => {
    const { location } = props;

    const { close } = useDialogContext();
    const { t } = useTranslations();

    return (
        <>
            <Dialog.Header
                title={t('app.workspace.workspaceWelcomeDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <p className="text-base leading-normal text-surface-secondary">
                    {t('app.workspace.workspaceWelcomeDialog.description')}
                </p>
                <div className="flex flex-col gap-4">
                    {features.map(({ icon, titleKey, descriptionKey }) => (
                        <div
                            className="flex flex-row items-start gap-3"
                            key={titleKey}
                        >
                            <AvatarIcon icon={icon} variant="primary" />
                            <div className="flex flex-col gap-0.5">
                                <p className="text-base leading-tight font-normal text-surface-primary">
                                    {t(titleKey)}
                                </p>
                                <p className="text-base leading-normal text-surface-secondary">
                                    {t(descriptionKey)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-sm leading-normal text-surface-secondary">
                    {t('app.workspace.workspaceWelcomeDialog.note')}
                </p>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.workspace.workspaceWelcomeDialog.action.openWorkspace',
                    ),
                    onClick: () => {
                        // The only way out of the dialog, and the moment the first run is recorded as done.
                        workspaceWelcomeUtils.markWelcomeSeen();
                        close(location.id);
                    },
                }}
            />
        </>
    );
};
