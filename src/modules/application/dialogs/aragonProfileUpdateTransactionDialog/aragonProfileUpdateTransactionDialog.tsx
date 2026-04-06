'use client';

import { Card, invariant, MemberAvatar, Tag } from '@aragon/gov-ui-kit';
import { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper/useStepper';

export interface IAragonProfileUpdateTransactionDialogParams {
    /** ENS name of the user. */
    ensName: string;
    /** Connected wallet address. */
    address: string;
    /** Current ENS avatar URL for display. */
    avatarSrc?: string;
}

/** Props for {@link AragonProfileUpdateTransactionDialog}. */
export interface IAragonProfileUpdateTransactionDialogProps
    extends IDialogComponentProps<IAragonProfileUpdateTransactionDialogParams> {}

export const AragonProfileUpdateTransactionDialog: React.FC<
    IAragonProfileUpdateTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileUpdateTransactionDialog: required params must be set.',
    );
    const { ensName, address, avatarSrc } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep: TransactionDialogStep.PREPARE });

    // TODO: implement ENS record update transaction
    const prepareTransaction = async () => ({
        to: '0x0' as `0x${string}`,
        data: '0x' as `0x${string}`,
        value: BigInt(0),
    });

    return (
        <TransactionDialog
            description={t(
                'app.application.aragonProfileUpdateTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            onCancelClick={() => close(location.id)}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.application.aragonProfileUpdateTransactionDialog.submit',
            )}
            successLink={{
                label: t(
                    'app.application.aragonProfileUpdateTransactionDialog.successLink.label',
                ),
            }}
            title={t(
                'app.application.aragonProfileUpdateTransactionDialog.title',
            )}
        >
            <Card className="w-full border border-neutral-100 px-6 py-0 shadow-neutral-sm">
                <div className="flex flex-col gap-3 py-6">
                    <div className="flex items-center gap-4">
                        <MemberAvatar
                            address={address}
                            avatarSrc={avatarSrc}
                            ensName={ensName}
                            size="md"
                        />
                        <div className="flex flex-1 justify-end">
                            <Tag
                                label={t(
                                    'app.application.aragonProfileUpdateTransactionDialog.you',
                                )}
                            />
                        </div>
                    </div>
                    <p className="truncate text-neutral-800 text-xl leading-tight">
                        {ensName}
                    </p>
                </div>
            </Card>
        </TransactionDialog>
    );
};
