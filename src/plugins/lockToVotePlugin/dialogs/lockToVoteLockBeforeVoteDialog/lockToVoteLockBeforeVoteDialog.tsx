'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { parseUnits } from 'viem';
import {
    AssetInput,
    type IAssetInputFormData,
} from '@/modules/finance/components/assetInput';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useLockToVoteData } from '../../hooks/useLockToVoteData';
import type { ILockToVotePlugin } from '../../types';

export interface ILockToVoteLockBeforeVoteDialogParams {
    /**
     * Lock to vote plugin.
     */
    plugin: ILockToVotePlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback called on vote click.
     */
    onVoteClick: (lockAmount?: bigint) => void;
}

export interface ILockToVoteLockBeforeVoteDialogProps
    extends IDialogComponentProps<ILockToVoteLockBeforeVoteDialogParams> {}

export const LockToVoteLockBeforeVoteDialog: React.FC<
    ILockToVoteLockBeforeVoteDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'LockToVoteLockBeforeVoteDialog: required parameters must be set.',
    );
    const { plugin, daoId, onVoteClick } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { balance } = useLockToVoteData({ plugin, daoId });

    const { token } = plugin.settings;

    const defaultValues = { asset: { token, amount: '0' } };
    const formValues = useForm<IAssetInputFormData>({
        mode: 'onSubmit',
        defaultValues,
    });

    const lockAmount = useWatch<IAssetInputFormData, 'amount'>({
        control: formValues.control,
        name: 'amount',
    });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);

    const primaryAction = {
        label: t(
            'app.plugins.lockToVote.lockToVoteLockBeforeVoteDialog.action.lock',
        ),
        onClick: () => onVoteClick(lockAmountWei),
        type: 'submit',
    };

    const secondaryAction = {
        label: t(
            'app.plugins.lockToVote.lockToVoteLockBeforeVoteDialog.action.cancel',
        ),
        onClick: () => close(),
    };

    return (
        <FormProvider {...formValues}>
            <Dialog.Header
                onClose={close}
                title={t(
                    'app.plugins.lockToVote.lockToVoteLockBeforeVoteDialog.title',
                )}
            />
            <Dialog.Content className="flex flex-col gap-4 pt-4 pb-6">
                <AssetInput
                    disableAssetField={true}
                    hideAmountLabel={true}
                    hideMax={true}
                    percentageSelection={{
                        totalBalance: balance,
                        tokenDecimals: token.decimals,
                    }}
                />
                <p className="font-normal text-neutral-500 text-sm">
                    {t(
                        'app.plugins.lockToVote.lockToVoteLockBeforeVoteDialog.info',
                    )}
                </p>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
            />
        </FormProvider>
    );
};
