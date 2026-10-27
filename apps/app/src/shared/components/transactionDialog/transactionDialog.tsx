import { CustomTransactionController } from './customTransactionController';
import { ManagedTransactionController } from './managedTransactionController';
import type {
    ITransactionDialogCustomProps,
    ITransactionDialogProps,
} from './transactionDialog.api';

export const TransactionDialog = <TCustomStepId extends string>(
    props:
        | ITransactionDialogProps<TCustomStepId>
        | ITransactionDialogCustomProps<TCustomStepId>,
) => {
    if (props.mode === 'custom') {
        return <CustomTransactionController {...props} />;
    }

    return <ManagedTransactionController {...props} />;
};
