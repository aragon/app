import { render, screen } from '@testing-library/react';
import {
    type ITokenVotingOptionsProps,
    TokenVotingOptions,
} from './tokenVotingOptions';

describe('<TokenVotingOptions /> component', () => {
    const optionKey = 'app.plugins.token.tokenSubmitVote.options';
    const getOptionText = (key: string) =>
        screen.getByText(`${optionKey}.${key}`);

    const createTestComponent = (props?: Partial<ITokenVotingOptionsProps>) => {
        const completeProps: ITokenVotingOptionsProps = {
            onChange: jest.fn(),
            ...props,
        };

        return <TokenVotingOptions {...completeProps} />;
    };

    it('renders the yes, abstain and no vote options', () => {
        render(createTestComponent());
        ['yes', 'abstain', 'no'].forEach((key) =>
            expect(getOptionText(key)).toBeInTheDocument(),
        );
    });

    it('uses approval copy and only enables No for objection proposals', () => {
        render(createTestComponent({ isObjection: true, isVeto: true }));

        expect(
            screen.getByText(
                `${optionKey}.label (label=${optionKey}.vetoLabel)`,
            ),
        ).toBeInTheDocument();

        const noOption = getOptionText('no').closest('button');
        expect(noOption).toBeEnabled();
        expect(noOption).toHaveClass('active:border-success-500');
        expect(getOptionText('vetoNoDescription')).toBeInTheDocument();
        const yesOption = getOptionText('yes').closest('button');
        expect(yesOption).toBeDisabled();
        expect(yesOption).toHaveClass('active:border-critical-500');
        expect(getOptionText('vetoYesDescription')).toBeInTheDocument();
        expect(getOptionText('abstain').closest('button')).toBeDisabled();
        expect(getOptionText('objectionHelpText')).toBeInTheDocument();
    });
});
