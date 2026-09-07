import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { VoteOption } from '@/plugins/tokenPlugin/types';
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

        return (
            <GukModulesProvider>
                <TokenVotingOptions {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders optional help text between the question and voting options', () => {
        const helpText = 'Only No can be selected.';
        render(createTestComponent({ helpText }));

        const question = screen.getByText(/tokenSubmitVote.options.label/);
        const help = screen.getByText(helpText);
        const yesOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.yes/,
        });

        expect(question.closest('label')).toContainElement(help);
        expect(question.compareDocumentPosition(help)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
        expect(
            help.compareDocumentPosition(yesOption) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it('does not add help text markup when the prop is omitted', () => {
        render(createTestComponent());

        const question = screen.getByText(/tokenSubmitVote.options.label/);

        expect(question.closest('label')).toHaveTextContent(
            /^app\.plugins\.token\.tokenSubmitVote\.options\.label/,
        );
        expect(question.closest('label')?.children).toHaveLength(1);
    });

    it('keeps normal copy when individual options are disabled without reasons', () => {
        render(
            createTestComponent({
                disabledOptions: [
                    { value: VoteOption.YES.toString() },
                    { value: VoteOption.ABSTAIN.toString() },
                ],
            }),
        );

        const yesOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.yes/,
        });
        const abstainOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.abstain/,
        });
        const noOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.no/,
        });

        expect(yesOption).toHaveTextContent(
            /tokenSubmitVote.options.approveYesDescription/,
        );
        expect(abstainOption).toHaveTextContent(
            /tokenSubmitVote.options.abstain/,
        );
        expect(noOption).toHaveTextContent(
            /tokenSubmitVote.options.approveNoDescription/,
        );
        expect(yesOption).toBeDisabled();
        expect(abstainOption).toBeDisabled();
        expect(noOption).toBeEnabled();
    });

    it('preserves veto copy and disables every option when requested', () => {
        render(createTestComponent({ disableOptions: true, isVeto: true }));

        const options = screen.getAllByRole('radio');

        expect(options).toHaveLength(3);
        options.forEach((option) => expect(option).toBeDisabled());
        expect(options[0]).toHaveTextContent(
            /tokenSubmitVote.options.vetoYesDescription/,
        );
        expect(options[2]).toHaveTextContent(
            /tokenSubmitVote.options.vetoNoDescription/,
        );
    });

    it('preserves the selected value and change callback', async () => {
        const onChange = jest.fn();
        render(
            createTestComponent({
                onChange,
                value: VoteOption.YES.toString(),
            }),
        );

        const yesOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.yes/,
        });
        const noOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.no/,
        });

        expect(yesOption).toHaveAttribute('aria-checked', 'true');
        await userEvent.click(noOption);
        expect(onChange).toHaveBeenCalledWith(VoteOption.NO.toString());
    });
});
