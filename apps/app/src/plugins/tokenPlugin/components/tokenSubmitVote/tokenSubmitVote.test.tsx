import { render, screen } from '@testing-library/react';
import { GovernanceDaoSlotId } from '@/modules/governance/constants/moduleDaoSlots';
import { generateTokenProposal } from '@/plugins/tokenPlugin/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type ITokenSubmitVoteProps, TokenSubmitVote } from './tokenSubmitVote';

jest.mock('./components/tokenSubmitVoteDefault', () => ({
    TokenSubmitVoteDefault: (props: { daoId: string }) => (
        <div data-daoid={props.daoId} data-testid="token-submit-vote-default" />
    ),
}));

describe('<TokenSubmitVote /> component', () => {
    const getSlotComponentSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotComponent',
    );

    afterEach(() => {
        getSlotComponentSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenSubmitVoteProps>) => {
        const completeProps: ITokenSubmitVoteProps = {
            daoId: 'test-dao-id',
            proposal: generateTokenProposal(),
            ...props,
        };

        return <TokenSubmitVote {...completeProps} />;
    };

    it('renders the default voting controls when the DAO registers no submit-vote component', () => {
        getSlotComponentSpy.mockReturnValue(undefined);

        render(createTestComponent());

        expect(getSlotComponentSpy).toHaveBeenCalledWith({
            slotId: GovernanceDaoSlotId.GOVERNANCE_DAO_SUBMIT_VOTE,
            pluginId: 'test-dao-id',
        });
        expect(screen.getByTestId('token-submit-vote-default')).toHaveAttribute(
            'data-daoid',
            'test-dao-id',
        );
    });

    it('renders the DAO-specific component instead of the default controls when registered', () => {
        const DaoComponent = (props: { daoId: string }) => (
            <div data-daoid={props.daoId} data-testid="dao-submit-vote" />
        );
        getSlotComponentSpy.mockReturnValue(DaoComponent);

        render(createTestComponent());

        expect(screen.getByTestId('dao-submit-vote')).toHaveAttribute(
            'data-daoid',
            'test-dao-id',
        );
        expect(
            screen.queryByTestId('token-submit-vote-default'),
        ).not.toBeInTheDocument();
    });
});
