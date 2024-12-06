import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { TransactionStatus, type ITransactionStatusStepMeta } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AddressInput, addressUtils, Dialog, invariant, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSmartContractAbi, type IGetAbiUrlParams, type ISmartContractAbi } from '../../api/smartContractService';

export interface IVerifySmartContractDialogParams {
    /**
     * Network to use for the smart-contract verification.
     */
    network: Network;
    /**
     * Callback called on verification submit.
     */
    onSubmit?: (abi: ISmartContractAbi) => void;
}

export interface IVerifySmartContractDialogProps extends IDialogComponentProps<IVerifySmartContractDialogParams> {}

export interface IVerifySmartContractFormData {
    /**
     * Address to be verified.
     */
    smartContract?: ICompositeAddress;
    /**
     * ABI of the smart contract.
     */
    abi?: ISmartContractAbi;
}

export const VerifySmartContractDialog: React.FC<IVerifySmartContractDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'VerifySmartContractDialog: params must be defined.');
    const { network, onSubmit } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { handleSubmit, control } = useForm({ mode: 'onTouched' });

    const [addressInput, setAddressInput] = useState<string | undefined>('');
    const {
        label,
        value: smartContractValue,
        onChange: onSmartContractChange,
        ...smartContractField
    } = useFormField<IVerifySmartContractFormData, 'smartContract'>('smartContract', {
        label: t('app.governance.verifySmartContractDialog.smartContractLabel'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        control,
    });

    const { onChange: updateAbi } = useFormField<IVerifySmartContractFormData, 'abi'>('abi', {
        rules: { required: true },
        control,
    });

    const abiParams = { network, address: smartContractValue?.address };
    const { data: smartContractAbi, isLoading: isLoadingAbi } = useSmartContractAbi(
        { urlParams: abiParams as IGetAbiUrlParams },
        { enabled: smartContractValue != null },
    );

    const isContractVerified = smartContractAbi != null;

    const proxyState = isLoadingAbi ? 'pending' : smartContractAbi?.implementationAddress != null ? 'success' : 'idle';
    const abiState = isLoadingAbi ? 'pending' : isContractVerified ? 'success' : 'warning';
    const getStepLabel = (step: string, status = 'default') =>
        t(`app.governance.verifySmartContractDialog.step.${step}.${status}`);

    const verificationSteps: Array<IStepperStep<ITransactionStatusStepMeta>> = [
        { id: 'proxy', order: 0, meta: { label: getStepLabel('proxy'), state: proxyState } },
        {
            id: 'verify',
            order: 1,
            meta: { label: getStepLabel('verify'), warningLabel: getStepLabel('verify', 'warning'), state: abiState },
        },
        {
            id: 'abi',
            order: 2,
            meta: { label: getStepLabel('abi'), warningLabel: getStepLabel('abi', 'warning'), state: abiState },
        },
    ];

    const handleFormSubmit = (values: IVerifySmartContractFormData) => {
        onSubmit?.(values.abi!);
        close();
    };

    // Update ABI form field when fetching the smart-contract ABI
    useEffect(() => {
        updateAbi(smartContractAbi);
    }, [updateAbi, smartContractAbi]);

    const buttonLabel = smartContractValue?.address == null || isLoadingAbi ? 'verify' : 'add';

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Dialog.Header
                title={t('app.governance.verifySmartContractDialog.title')}
                description={t('app.governance.verifySmartContractDialog.description')}
            />
            <Dialog.Content className="flex flex-col gap-3 pb-2 pt-4 md:pb-4 md:pt-6">
                <AddressInput
                    placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                    chainId={1}
                    value={addressInput}
                    onChange={setAddressInput}
                    onAccept={onSmartContractChange}
                    {...smartContractField}
                />
                {smartContractValue?.address != null && (
                    <TransactionStatus.Container steps={verificationSteps}>
                        {verificationSteps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(`app.governance.verifySmartContractDialog.action.${buttonLabel}`),
                    type: 'submit',
                    isLoading: isLoadingAbi,
                }}
                secondaryAction={{ label: t('app.governance.verifySmartContractDialog.action.cancel'), onClick: close }}
            />
        </form>
    );
};
