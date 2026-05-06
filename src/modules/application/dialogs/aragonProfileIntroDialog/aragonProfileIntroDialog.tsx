'use client';

import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ApplicationDialogId } from '../../constants/applicationDialogId';

export interface IAragonProfileIntroDialogParams {
    /** Whether the user is creating a new profile or editing an existing one. */
    mode: 'create' | 'edit';
}

export interface IAragonProfileIntroDialogProps
    extends IDialogComponentProps<IAragonProfileIntroDialogParams> {}

export const AragonProfileIntroDialog: React.FC<
    IAragonProfileIntroDialogProps
> = (props) => {
    const { location } = props;
    const { id } = location;

    invariant(
        location.params != null,
        'AragonProfileIntroDialog: required params must be set.',
    );
    const { mode } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const handleCta = () => {
        if (mode === 'edit') {
            open(ApplicationDialogId.ARAGON_PROFILE);
        } else {
            open(ApplicationDialogId.ARAGON_PROFILE_CLAIM_SUBDOMAIN);
        }
    };

    const handleCancel = () => {
        close(id);
    };

    return (
        <Dialog.Content>
            <EmptyState
                description={t(
                    `app.application.aragonProfileIntroDialog.description.${mode}`,
                )}
                heading={t(
                    `app.application.aragonProfileIntroDialog.title.${mode}`,
                )}
                humanIllustration={{
                    body: 'ARAGON',
                    hairs: 'MIDDLE',
                    accessory: 'EARRINGS_RHOMBUS',
                    sunglasses: 'BIG_SEMIROUNDED',
                    expression: 'SMILE',
                }}
                primaryButton={{
                    label: t(
                        `app.application.aragonProfileIntroDialog.cta.${mode}`,
                    ),
                    onClick: handleCta,
                    className: 'sm:w-max',
                }}
                secondaryButton={{
                    label: t('app.application.aragonProfileIntroDialog.cancel'),
                    onClick: handleCancel,
                }}
            />
        </Dialog.Content>
    );
};
