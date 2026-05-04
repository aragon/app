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
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { IDelegateStatement } from '../../components/delegationStatementCard/delegateStatement.api';
import type { IDelegateStatementTransactionDialogParams } from './delegateStatementTransactionDialog.api';
import { delegateStatementTransactionDialogUtils } from './delegateStatementTransactionDialogUtils';

const TELEMETRY_MODULE = 'delegateStatementTransactionDialog';

export enum DelegateStatementTransactionStep {
    PIN_STATEMENT = 'PIN_STATEMENT',
}

export interface IDelegateStatementTransactionDialogProps
    extends IDialogComponentProps<IDelegateStatementTransactionDialogParams> {}

/**
 * Telemetry coverage:
 * - Pinata pin failure → `monitoringUtils.logError` with `stage: 'pinStatement'`
 *   (wired via `usePinJson` `onError`).
 * - ENS resolver lookup failure → `monitoringUtils.logError` with
 *   `stage: 'resolveEns'` (wired via the try/catch in `prepareTransaction`).
 * - User wallet rejection + simulation revert → routed through `TransactionDialog`'s
 *   internal Sentry instrumentation. The primitive does not currently expose an
 *   `onError` callback to wrappers; explicit module-tagged events at this layer
 *   would require an upstream change. Until then, those events surface as
 *   wagmi-tagged exceptions in the global Sentry stream.
 */
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
    } = usePinJson({
        onSuccess: stepper.nextStep,
        onError: (error) =>
            monitoringUtils.logError(error, {
                context: { module: TELEMETRY_MODULE, stage: 'pinStatement' },
            }),
    });

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

        let resolverAddress;
        try {
            resolverAddress = await getEnsResolver(wagmiConfig, {
                name: ensName,
                chainId: mainnet.id,
            });
        } catch (error) {
            monitoringUtils.logError(error, {
                context: { module: TELEMETRY_MODULE, stage: 'resolveEns' },
            });
            throw error;
        }

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
