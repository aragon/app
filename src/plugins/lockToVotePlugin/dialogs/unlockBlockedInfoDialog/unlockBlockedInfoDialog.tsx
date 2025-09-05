import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, EmptyState } from '@aragon/gov-ui-kit';

export interface IUnlockBlockedInfoDialogProps extends IDialogComponentProps {}

export const UnlockBlockedInfoDialog: React.FC<IUnlockBlockedInfoDialogProps> = () => {
    const { t } = useTranslations();
    const { close } = useDialogContext();

    return (
        <>
            <Dialog.Header
                title={t('app.plugins.lockToVote.unlockBlockedInfoDialog.title')}
                className="hidden"
                aria-hidden={true}
            />
            <Dialog.Content>
                <EmptyState
                    heading={t(`app.plugins.lockToVote.unlockBlockedInfoDialog.title`)}
                    description={t(`app.plugins.lockToVote.unlockBlockedInfoDialog.message`)}
                    objectIllustration={{ object: 'TIMELOCK' }}
                    primaryButton={{
                        label: t('app.plugins.lockToVote.unlockBlockedInfoDialog.action.ok'),
                        onClick: () => close(),
                    }}
                />
            </Dialog.Content>
        </>
    );
};
