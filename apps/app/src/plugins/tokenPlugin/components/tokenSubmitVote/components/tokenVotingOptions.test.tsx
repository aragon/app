import { render, screen } from '@testing-library/react';
import {
    type ITokenVotingOptionsProps,
    TokenVotingOptions,
} from './tokenVotingOptions';

describe('<TokenVotingOptions /> component', () => {
    const createTestComponent = (props?: Partial<ITokenVotingOptionsProps>) => {
        const completeProps: ITokenVotingOptionsProps = {
            onChange: jest.fn(),
            ...props,
        };

        return <TokenVotingOptions {...completeProps} />;
    };

    it('renders the yes, abstain and no vote options', () => {
        render(createTestComponent());
        expect(
            screen.getByText('app.plugins.token.tokenSubmitVote.options.yes'),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.token.tokenSubmitVote.options.abstain',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText('app.plugins.token.tokenSubmitVote.options.no'),
        ).toBeInTheDocument();
    });

    it('only renders the object option when the isObjection property is set', () => {
        render(createTestComponent({ isObjection: true }));
        expect(
            screen.getByText(
                'app.plugins.token.tokenSubmitVote.options.object',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('app.plugins.token.tokenSubmitVote.options.no'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText('app.plugins.token.tokenSubmitVote.options.yes'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.plugins.token.tokenSubmitVote.options.abstain',
            ),
        ).not.toBeInTheDocument();
    });
});
