'use client';

import { Dialog, Icon, IconType } from '@aragon/gov-ui-kit';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IWorkspaceWelcomeDialogProps extends IDialogComponentProps {}

const items = [
    { key: 'pending', icon: IconType.PEN },
    { key: 'tracking', icon: IconType.CLOCK },
] as const;

export const WorkspaceWelcomeDialog: React.FC<IWorkspaceWelcomeDialogProps> = (
    props,
) => {
    const { location } = props;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const handleClose = () => close(location.id);

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.workspace.workspaceWelcomeDialog.description',
                )}
                onClose={handleClose}
                title={t('app.workspace.workspaceWelcomeDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-4 pt-2 pb-4">
                {items.map(({ key, icon }) => (
                    <div className="flex items-center gap-3" key={key}>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                            <Icon
                                className="icon-accent-primary"
                                icon={icon}
                                size="sm"
                            />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p className="type-title-item--compact-card type-strong text-surface-primary">
                                {t(
                                    `app.workspace.workspaceWelcomeDialog.items.${key}.title`,
                                )}
                            </p>
                            <p className="type-body-compact--unstepped text-pretty text-surface-secondary">
                                {t(
                                    `app.workspace.workspaceWelcomeDialog.items.${key}.description`,
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.workspace.workspaceWelcomeDialog.action'),
                    onClick: handleClose,
                }}
            >
                <p
                    // biome-ignore lint/plugin/noPrimitiveTypography: added on main after the migration; no role assigned yet
                    className="-mb-2 text-xs leading-normal text-pretty text-surface-secondary"
                >
                    {t('app.workspace.workspaceWelcomeDialog.note')}
                </p>
            </Dialog.Footer>
        </>
    );
};
