import { Button } from '@aragon/ods';

export interface IMultisigApproveVoteProps {}

export const MultisigApproveVote: React.FC<IMultisigApproveVoteProps> = () => {
    return (
        <div className="pt-4">
            <Button size="md" variant="primary">
                Approve
            </Button>
        </div>
    );
};
