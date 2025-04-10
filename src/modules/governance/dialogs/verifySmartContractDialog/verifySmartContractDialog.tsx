import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { TransactionStatus, type ITransactionStatusStepMeta } from '@/shared/components/transactionStatus';
import type { ITransactionInfo } from '@/shared/components/transactionStatus/transactionStatusInfo';
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
    /**
     * Initial value to prepopulate the address input field.
     */
    initialValue?: string;
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

const formId = 'verifySmartContactForm';

export const VerifySmartContractDialog: React.FC<IVerifySmartContractDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'VerifySmartContractDialog: params must be defined.');
    const { network, onSubmit, initialValue = '' } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const defaultAddressValue = addressUtils.isAddress(initialValue) ? initialValue : undefined;
    const { handleSubmit, control } = useForm<IVerifySmartContractFormData>({
        mode: 'onTouched',
        defaultValues: { smartContract: { address: defaultAddressValue } },
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(initialValue);
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

    const { onChange: updateAbi, value: abiFieldValue } = useFormField<IVerifySmartContractFormData, 'abi'>('abi', {
        control,
    });

    const abiParams = { network, address: smartContractValue?.address };
    const { data: smartContractAbi, isLoading: isLoadingAbi } = useSmartContractAbi(
        { urlParams: abiParams as IGetAbiUrlParams },
        { enabled: smartContractValue != null },
    );

    const isContractVerified = smartContractAbi != null;
    const unverifiedContractName = t('app.governance.verifySmartContractDialog.unverified');

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
        const defaultAbi = {
            name: unverifiedContractName,
            address: values.smartContract!.address,
            network,
            implementationAddress: null,
            functions: [],
        };
        const processedAbi = smartContractAbi ?? defaultAbi;

        onSubmit?.(processedAbi);
        close();
    };

    // Update ABI form field when fetching the smart-contract ABI
    useEffect(() => {
        if (smartContractAbi?.address !== abiFieldValue?.address) {
            updateAbi(smartContractAbi);
        }
    }, [updateAbi, smartContractAbi, abiFieldValue]);

    const contractName = smartContractAbi?.name ?? unverifiedContractName;
    const buttonLabel = smartContractValue?.address == null || isLoadingAbi ? 'verify' : 'add';

    const transactionInfo: ITransactionInfo = {
        title: contractName,
    };

    return (
        <>
            <Dialog.Header title={t('app.governance.verifySmartContractDialog.title')} />
            <Dialog.Content description={t('app.governance.verifySmartContractDialog.description')}>
                <form className="flex flex-col gap-3 py-2" onSubmit={handleSubmit(handleFormSubmit)} id={formId}>
                    <AddressInput
                        placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                        chainId={1}
                        value={addressInput}
                        onChange={setAddressInput}
                        onAccept={onSmartContractChange}
                        {...smartContractField}
                    />
                    {smartContractValue?.address != null && (
                        <TransactionStatus.Container steps={verificationSteps} transactionInfo={transactionInfo}>
                            {verificationSteps.map((step) => (
                                <TransactionStatus.Step key={step.id} {...step} />
                            ))}
                        </TransactionStatus.Container>
                    )}
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(`app.governance.verifySmartContractDialog.action.${buttonLabel}`),
                    type: 'submit',
                    isLoading: isLoadingAbi,
                    form: formId,
                }}
                secondaryAction={{
                    label: t('app.governance.verifySmartContractDialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
