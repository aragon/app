'use client';

import { invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { mainnet } from 'viem/chains';
import { getEnsResolver } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { Network } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider/dialogProvider.api';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import type { IDelegateStatement } from '../../components/delegationStatementCard/delegateStatement.api';
import type { IDelegateStatementTransactionDialogParams } from './delegateStatementTransactionDialog.api';
import { delegateStatementTransactionDialogUtils } from './delegateStatementTransactionDialogUtils';

export enum DelegateStatementTransactionStep {
    PIN_STATEMENT = 'PIN_STATEMENT',
}

export interface IDelegateStatementTransactionDialogProps
    extends IDialogComponentProps<IDelegateStatementTransactionDialogParams> {}

export const DelegateStatementTransactionDialog: React.FC<
    IDelegateStatementTransactionDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'DelegateStatementTransactionDialog: required parameters must be set.',
    );

    const { ensName, network, tokenAddress, content } = location.params;

    const { t } = useTranslations();
    const queryClient = useQueryClient();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        DelegateStatementTransactionStep | TransactionDialogStep
    >({
        initialActiveStep: DelegateStatementTransactionStep.PIN_STATEMENT,
    });

    const {
        data: pinJsonData,
        status: pinStatus,
        mutate: pinJson,
    } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const statement: IDelegateStatement = {
                version: 1,
                type: 'statement',
                format: 'markdown',
                content,
            };
            pinJson({ body: statement }, params);
        },
        [content, pinJson],
    );

    const handlePrepareTransaction = async () => {
        invariant(
            pinJsonData != null,
            'DelegateStatementTransactionDialog: statement must be pinned before tx prepare runs.',
        );
        const { IpfsHash: cid } = pinJsonData;

        const resolverAddress = await getEnsResolver(wagmiConfig, {
            name: ensName,
            chainId: mainnet.id,
        });

        return delegateStatementTransactionDialogUtils.buildTransaction({
            resolverAddress,
            ensName,
            network,
            tokenAddress,
            cid,
        });
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['delegateStatementCid'] });
        queryClient.invalidateQueries({ queryKey: ['ipfsJson'] });
    };

    const customSteps: ITransactionDialogStep<DelegateStatementTransactionStep>[] =
        [
            {
                id: DelegateStatementTransactionStep.PIN_STATEMENT,
                order: 0,
                meta: {
                    label: t(
                        `app.governance.delegateStatementTransactionDialog.step.${DelegateStatementTransactionStep.PIN_STATEMENT}.label`,
                    ),
                    errorLabel: t(
                        `app.governance.delegateStatementTransactionDialog.step.${DelegateStatementTransactionStep.PIN_STATEMENT}.errorLabel`,
                    ),
                    state: pinStatus,
                    action: handlePinJson,
                    auto: true,
                },
            },
        ];

    return (
        <TransactionDialog<DelegateStatementTransactionStep>
            customSteps={customSteps}
            description={t(
                'app.governance.delegateStatementTransactionDialog.description',
            )}
            network={Network.ETHEREUM_MAINNET}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.governance.delegateStatementTransactionDialog.submit',
            )}
            successLink={{
                label: t(
                    'app.governance.delegateStatementTransactionDialog.successLinkLabel',
                ),
                onClick: handleSuccess,
            }}
            title={t('app.governance.delegateStatementTransactionDialog.title')}
        />
    );
};
