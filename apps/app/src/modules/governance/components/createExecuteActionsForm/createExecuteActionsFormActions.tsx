import { ProposalActionsEditor } from '../proposalActionsEditor';

export interface ICreateExecuteActionsFormActionsProps {
    /**
     * ID of the DAO to execute actions on.
     */
    daoId: string;
}

export const CreateExecuteActionsFormActions: React.FC<
    ICreateExecuteActionsFormActionsProps
> = (props) => {
    const { daoId } = props;

    return <ProposalActionsEditor daoId={daoId} />;
};
