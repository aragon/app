import { Dialog, EmptyState } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IUnlockBlockedInfoDialogProps extends IDialogComponentProps {}

export const UnlockBlockedInfoDialog: React.FC<
    IUnlockBlockedInfoDialogProps
> = () => {
    const { t } = useTranslations();
    const { close } = useDialogContext();

    return (
        <>
            <Dialog.Header
                aria-hidden={true}
                className="hidden"
                title={t(
                    'app.plugins.lockToVote.unlockBlockedInfoDialog.title',
                )}
            />
            <Dialog.Content>
                <EmptyState
                    description={t(
                        'app.plugins.lockToVote.unlockBlockedInfoDialog.message',
                    )}
                    heading={t(
                        'app.plugins.lockToVote.unlockBlockedInfoDialog.title',
                    )}
                    objectIllustration={{ object: 'TIMELOCK' }}
                    primaryButton={{
                        label: t(
                            'app.plugins.lockToVote.unlockBlockedInfoDialog.action.ok',
                        ),
                        onClick: () => close(),
                    }}
                />
            </Dialog.Content>
        </>
    );
};
