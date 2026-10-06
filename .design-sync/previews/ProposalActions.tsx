import {
    Button,
    GukModulesProvider,
    generateProposalActionChangeMembers,
    generateProposalActionChangeSettings,
    generateProposalActionTokenMint,
    ProposalActions,
} from '@aragon/gov-ui-kit';

const noOp = () => undefined;

export const Default = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 640 }}>
            <ProposalActions.Root actionsCount={2}>
                <ProposalActions.Container emptyStateDescription="Proposal has no actions">
                    <ProposalActions.Item
                        action={generateProposalActionChangeMembers({
                            inputData: {
                                function: 'addMembers',
                                contract: 'Multisig',
                                parameters: [],
                            },
                            members: [
                                {
                                    address:
                                        '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311',
                                },
                            ],
                            to: '0x96208a79d4f3386922ebEc815EF1C0d02b48Eb70',
                        })}
                        index={0}
                    />
                    <ProposalActions.Item
                        action={generateProposalActionChangeSettings({
                            inputData: {
                                function: 'updateSettings',
                                contract: 'Multisig',
                                parameters: [],
                            },
                            existingSettings: [
                                {
                                    term: 'Proposal creation',
                                    definition: 'Any address',
                                },
                            ],
                            proposedSettings: [
                                {
                                    term: 'Proposal creation',
                                    definition: 'Only members',
                                },
                            ],
                            to: '0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d',
                        })}
                        index={1}
                    />
                </ProposalActions.Container>
                <ProposalActions.Footer>
                    <Button className="text-nowrap" size="md">
                        Execute actions
                    </Button>
                </ProposalActions.Footer>
            </ProposalActions.Root>
        </div>
    </GukModulesProvider>
);

export const TokenMint = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 640 }}>
            <ProposalActions.Root
                actionsCount={1}
                expandedActions={['0']}
                onExpandedActionsChange={noOp}
            >
                <ProposalActions.Container emptyStateDescription="Proposal has no actions">
                    <ProposalActions.Item
                        action={generateProposalActionTokenMint({
                            to: '0x80CB2f4f9B403C4C418C597d96c95FE14FD344a6',
                            receiver: {
                                address:
                                    '0x15b4bfc1c85ffbdb6d7d0eb9f30c49657dfb1f5b',
                                name: 'contributors.eth',
                                currentBalance: '500',
                                newBalance: '1500',
                            },
                            inputData: {
                                function: 'mint',
                                contract: 'Governance Token',
                                parameters: [],
                            },
                        })}
                        index={0}
                    />
                </ProposalActions.Container>
                <ProposalActions.Footer>
                    <Button className="text-nowrap" size="md">
                        Execute actions
                    </Button>
                </ProposalActions.Footer>
            </ProposalActions.Root>
        </div>
    </GukModulesProvider>
);

export const VerifiedDecoded = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 640 }}>
            <ProposalActions.Root
                actionsCount={1}
                expandedActions={['0']}
                onExpandedActionsChange={noOp}
            >
                <ProposalActions.Container emptyStateDescription="Proposal has no actions">
                    <ProposalActions.Item
                        action={{
                            type: 'unknown',
                            from: '0x1D03D98c0aec1f8e8354b74A126C6cEcB55E79c4',
                            to: '0xf067de59A16D9C252BD4319C34B8858ef96c0aa8',
                            value: '0',
                            data: '0x414bf389000000000000000000000000be9f61555f50dd6167f2772e9cf7519790d96624',
                            inputData: {
                                function: 'exactInputSingle',
                                contract: 'Uniswap V3: Router',
                                parameters: [
                                    {
                                        name: 'tokenIn',
                                        type: 'address',
                                        value: '0xbe9F61555F50DD6167f2772e9CF7519790d96624',
                                        notice: 'The token in',
                                    },
                                    {
                                        name: 'tokenOut',
                                        type: 'address',
                                        value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                                        notice: 'The token out',
                                    },
                                    {
                                        name: 'fee',
                                        type: 'uint24',
                                        value: '3000',
                                    },
                                    {
                                        name: 'recipient',
                                        type: 'address',
                                        value: '0x80CB2f4f9B403C4C418C597d96c95FE14FD344a6',
                                    },
                                ],
                            },
                        }}
                        index={0}
                    />
                </ProposalActions.Container>
            </ProposalActions.Root>
        </div>
    </GukModulesProvider>
);

export const Loading = () => (
    <GukModulesProvider>
        <div style={{ width: '100%', maxWidth: 640 }}>
            <ProposalActions.Root actionsCount={2} isLoading={true}>
                <ProposalActions.Container emptyStateDescription="Proposal has no actions" />
                <ProposalActions.Footer />
            </ProposalActions.Root>
        </div>
    </GukModulesProvider>
);
