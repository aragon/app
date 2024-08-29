import { Button, CardEmptyState, IconType, IProposalAction, ProposalActions } from '@aragon/ods';

export interface ICreateProposalFormActionsProps {
    actions?: IProposalAction[];
}

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { actions = [] } = props;

    return (
        <div className="flex flex-col gap-y-10">
            {actions.length > 0 ? (
                <ProposalActions actions={actions} />
            ) : (
                <CardEmptyState
                    heading="No actions added"
                    description="Add actions by selecting them, interacting with custom contracts, uploading actions or connect with any DApp."
                    objectIllustration={{ object: 'SMART_CONTRACT' }}
                    isStacked={false}
                />
            )}
            <div className="flex w-full justify-between">
                <div className="flex gap-x-3">
                    <Button variant="primary" size="md" iconLeft={IconType.PLUS}>
                        Action
                    </Button>
                    {/* <Button variant="secondary" size="md" iconRight={IconType.BLOCKCHAIN_SMARTCONTRACT}>
                        Custom
                    </Button>
                    <Button variant="secondary" size="md" iconRight={IconType.WITHDRAW}>
                        Upload
                    </Button>
                    <Button variant="secondary" size="md" iconRight={IconType.BLOCKCHAIN_WALLET}>
                        Connect
                    </Button> */}
                </div>
                {/* <DropdownContainer
                    size="md"
                    align="end"
                    customTrigger={<Button variant="tertiary" size="md" iconLeft={IconType.DOTS_VERTICAL} />}
                /> */}
            </div>
        </div>
    );
};
