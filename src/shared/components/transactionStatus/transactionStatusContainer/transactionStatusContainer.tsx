import type { ComponentProps } from 'react';

export interface ITransactionStatusContainerProps extends ComponentProps<'div'> {
    /**
     * ID of the current active step.
     */
    activeStep?: string;
}

export const TransactionStatusContainer: React.FC<ITransactionStatusContainerProps> = (props) => {
    return <div {...props} />;
};
