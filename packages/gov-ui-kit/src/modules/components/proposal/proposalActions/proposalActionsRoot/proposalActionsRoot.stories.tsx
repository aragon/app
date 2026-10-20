import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../../../../../core';
import { ProposalActions } from '../index';
import { generateProposalAction } from '../proposalActionsTestUtils';

const meta: Meta<typeof ProposalActions.Root> = {
    title: 'Modules/Proposal/ProposalActions/ProposalActions.Root',
    component: ProposalActions.Root,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/ISSDryshtEpB7SUSdNqAcw/Governance-UI-Kit?node-id=18996-12757&t=tQiF5klPD9cjUit6-4',
        },
    },
};

type Story = StoryObj<typeof ProposalActions.Root>;

/**
 * Default usage example of the ProposalActions.Root component.
 */
export const Default: Story = {
    args: {
        actionsCount: 2,
    },
    render: (props) => (
        <ProposalActions.Root {...props}>
            <ProposalActions.Container emptyStateDescription="Proposal has no actions">
                <ProposalActions.Item
                    action={generateProposalAction({
                        inputData: { function: 'addAddresses', contract: 'Multisig', parameters: [] },
                        to: '0x96208a79d4f3386922ebEc815EF1C0d02b48Eb70',
                    })}
                />
                <ProposalActions.Item
                    action={generateProposalAction({
                        inputData: { function: 'removeAddresses', contract: 'Multisig', parameters: [] },
                        to: '0x96208a79d4f3386922ebEc815EF1C0d02b48Eb70',
                    })}
                />
            </ProposalActions.Container>
            <ProposalActions.Footer>
                <Button className="text-nowrap" size="md">
                    Execute actions
                </Button>
            </ProposalActions.Footer>
        </ProposalActions.Root>
    ),
};

/**
 * Example usage of the ProposalActions.Root component with controlled accordion state and custom action IDs.
 */
export const Controlled: Story = {
    render: (props) => {
        const [expandedActions, setExpandedActions] = useState<string[]>([]);

        const actionIds = ['bfaed98c-7892-4e55-9a6c-f32a36cc41cf', 'aca264be-2884-4bab-9445-f29ca0869fdb'];
        const actions = [
            {
                id: actionIds[0],
                ...generateProposalAction({
                    inputData: { function: 'removeAddresses', contract: 'Multisig', parameters: [] },
                    to: '0x5283D291DBCF85356A21bA090E6db59121208b44',
                }),
            },
            {
                id: actionIds[1],
                ...generateProposalAction({
                    inputData: { function: 'addAddresses', contract: 'Multisig', parameters: [] },
                    to: '0x5283D291DBCF85356A21bA090E6db59121208b44',
                }),
            },
        ];

        return (
            <ProposalActions.Root
                expandedActions={expandedActions}
                onExpandedActionsChange={setExpandedActions}
                {...props}
            >
                <ProposalActions.Container emptyStateDescription="Proposal has no actions">
                    {actions.map((action) => (
                        <ProposalActions.Item action={action} key={action.id} value={action.id} />
                    ))}
                </ProposalActions.Container>
                <ProposalActions.Footer actionIds={actionIds} />
            </ProposalActions.Root>
        );
    },
};

/**
 * Example usage of the ProposalActions.Root component with loading state.
 */
export const Loading: Story = {
    args: {
        isLoading: true,
        actionsCount: 2,
    },
    render: (props) => (
        <ProposalActions.Root {...props}>
            <ProposalActions.Container emptyStateDescription="Proposal has no actions" />
            <ProposalActions.Footer />
        </ProposalActions.Root>
    ),
};

export default meta;
