import { Card } from '@aragon/gov-ui-kit';

export interface IDelegationStatementCardProps {
    /**
     * Address of the token for which the statement is managed.
     */
    tokenAddress: string;
}

export const DelegationStatementCard: React.FC<
    IDelegationStatementCardProps
> = (props) => {
    const { tokenAddress } = props;

    return (
        <Card className="p-6">DelegationStatementCard for {tokenAddress}</Card>
    );
};
