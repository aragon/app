'use client';

import { Dialog, EmptyState } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ApplicationDialogId } from '../../constants/applicationDialogId';

/** Optional params for {@link AragonProfileIntroDialog}. */
export interface IAragonProfileIntroDialogParams {}

/** Props for {@link AragonProfileIntroDialog}. */
export interface IAragonProfileIntroDialogProps
    extends IDialogComponentProps<IAragonProfileIntroDialogParams> {}

export const AragonProfileIntroDialog: React.FC<
    IAragonProfileIntroDialogProps
> = (props) => {
    const { location } = props;
    const { id } = location;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const handleCreateProfile = () => {
        open(ApplicationDialogId.ARAGON_PROFILE_CLAIM_SUBDOMAIN);
    };

    const handleCancel = () => {
        close(id);
    };

    return (
        <Dialog.Content className="flex flex-col items-center gap-4">
            <EmptyState
                description={t(
                    'app.application.aragonProfileIntroDialog.description',
                )}
                heading={t('app.application.aragonProfileIntroDialog.title')}
                humanIllustration={{
                    body: 'ARAGON',
                    hairs: 'MIDDLE',
                    accessory: 'EARRINGS_RHOMBUS',
                    sunglasses: 'BIG_SEMIROUNDED',
                    expression: 'SMILE',
                }}
                primaryButton={{
                    label: t('app.application.aragonProfileIntroDialog.cta'),
                    onClick: handleCreateProfile,
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
