'use client';

import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { parseUnits } from 'viem';
import { useLockToVoteData } from '../../hooks/useLockToVoteData';
import type { ILockToVotePlugin } from '../../types';

export interface ILockToVoteLockTokensDialogParams {
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

export interface ILockToVoteLockTokensDialogProps extends IDialogComponentProps<ILockToVoteLockTokensDialogParams> {}

export const LockToVoteLockTokensDialog: React.FC<ILockToVoteLockTokensDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'LockToVoteLockTokensDialog: required parameters must be set.');
    const { plugin, daoId, onVoteClick } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { balance } = useLockToVoteData({ plugin, daoId });

    const { token } = plugin.settings;

    const defaultValues = { asset: { token, amount: '0' } };
    const formValues = useForm<IAssetInputFormData>({ mode: 'onSubmit', defaultValues });

    const lockAmount = useWatch<IAssetInputFormData, 'amount'>({ control: formValues.control, name: 'amount' });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);

    const primaryAction = {
        label: t('app.plugins.lockToVote.lockToVoteLockTokensDialog.action.lock'),
        onClick: () => onVoteClick(lockAmountWei),
        type: 'submit',
    };

    const secondaryAction = {
        label: t('app.plugins.lockToVote.lockToVoteLockTokensDialog.action.cancel'),
        onClick: () => close(),
    };

    return (
        <FormProvider {...formValues}>
            <Dialog.Content>
                <AssetInput
                    disableAssetField={true}
                    hideMax={true}
                    hideAmountLabel={true}
                    percentageSelection={{ totalBalance: balance, tokenDecimals: token.decimals }}
                />
            </Dialog.Content>
            <Dialog.Footer primaryAction={primaryAction} secondaryAction={secondaryAction} />
        </FormProvider>
    );
};
