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

    it('disables all options but object and renders a help text when the isObjection property is set', () => {
        render(createTestComponent({ isObjection: true }));

        const objectOption = screen.getByText(
            'app.plugins.token.tokenSubmitVote.options.object',
        );
        expect(objectOption).toBeInTheDocument();
        expect(objectOption.closest('button')).toBeEnabled();

        expect(
            screen
                .getByText('app.plugins.token.tokenSubmitVote.options.yes')
                .closest('button'),
        ).toBeDisabled();
        expect(
            screen
                .getByText('app.plugins.token.tokenSubmitVote.options.abstain')
                .closest('button'),
        ).toBeDisabled();

        expect(
            screen.getByText(
                'app.plugins.token.tokenSubmitVote.options.objectionHelpText',
            ),
        ).toBeInTheDocument();
    });
});
