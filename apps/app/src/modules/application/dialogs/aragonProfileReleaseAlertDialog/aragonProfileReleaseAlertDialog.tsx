'use client';

import { DialogAlert, DialogAlertFooter, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ApplicationDialogId } from '../../constants/applicationDialogId';

export interface IAragonProfileReleaseAlertDialogParams {
    /** Full Aragon ENS name being released, e.g. "alice.aragon.eth". */
    ensName: string;
}

export interface IAragonProfileReleaseAlertDialogProps
    extends IDialogComponentProps<IAragonProfileReleaseAlertDialogParams> {}

export const AragonProfileReleaseAlertDialog: React.FC<
    IAragonProfileReleaseAlertDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileReleaseAlertDialog: required params must be set.',
    );
    const { ensName } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const handleCancel = () => close(location.id);

    const handleConfirm = () => {
        open(ApplicationDialogId.ARAGON_PROFILE_RELEASE_TRANSACTION, {
            params: { ensName },
        });
    };

    return (
        <>
            <DialogAlert.Header
                title={t(
                    'app.application.aragonProfileReleaseAlertDialog.title',
                )}
            />
            <DialogAlert.Content>
                <p className="pb-4 font-normal text-base text-neutral-500 leading-normal">
                    {t(
                        'app.application.aragonProfileReleaseAlertDialog.description',
                        { ensName },
                    )}
                </p>
            </DialogAlert.Content>
            <DialogAlertFooter
                actionButton={{
                    label: t(
                        'app.application.aragonProfileReleaseAlertDialog.actions.confirm',
                    ),
                    onClick: handleConfirm,
                }}
                cancelButton={{
                    label: t(
                        'app.application.aragonProfileReleaseAlertDialog.actions.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </>
    );
};
