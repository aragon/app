import type { Meta, StoryObj } from '@storybook/react-vite';
import { type VoteProposalDataListItem, VoteProposalDataListItemSkeleton } from '..';

const meta: Meta<typeof VoteProposalDataListItem.Skeleton> = {
    title: 'Modules/Components/Vote/VoteProposalDataListItem/VoteProposalDataListItem.Skeleton',
    component: VoteProposalDataListItemSkeleton,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/ISSDryshtEpB7SUSdNqAcw/Governance-UI-Kit?node-id=17239-29368&m',
        },
    },
};

type Story = StoryObj<typeof VoteProposalDataListItem.Skeleton>;

/**
 * Default usage example of the VoteProposalDataListItem.Skeleton component.
 */
export const Default: Story = {};

export default meta;
