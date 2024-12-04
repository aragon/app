import * as DialogProvider from '@/shared/components/dialogProvider';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GovernanceDialogs } from '../../constants/moduleDialogs';
import { CreateProposalPageClient, type ICreateProposalPageClientProps } from './createProposalPageClient';

jest.mock('./createProposalPageClientSteps', () => ({
    CreateProposalPageClientSteps: () => <button data-testid="steps-mock" type="submit" />,
}));

describe('<CreateProposalPageClient /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ICreateProposalPageClientProps>) => {
        const completeProps: ICreateProposalPageClientProps = {
            daoId: 'test',
            pluginAddress: '0x123',
            ...props,
        };

        return <CreateProposalPageClient {...completeProps} />;
    };

    it('renders the create-proposal wizard steps', async () => {
        render(createTestComponent());
        expect(await screen.findByText(/wizard.container.step \(number=1\)/)).toBeInTheDocument();
        expect(screen.getByText(/wizard.container.total \(total=3\)/)).toBeInTheDocument();
        expect(screen.getByTestId('steps-mock')).toBeInTheDocument();
    });

    it('opens the publish proposal dialog on form submit', async () => {
        const daoId = 'test-id';
        const pluginAddress = '0x472839';
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue({ open, close: jest.fn() });
        render(createTestComponent({ daoId, pluginAddress }));
        // Advance the wizard three times to trigger the submit function
        await userEvent.click(screen.getByTestId('steps-mock'));
        await userEvent.click(screen.getByTestId('steps-mock'));
        await userEvent.click(screen.getByTestId('steps-mock'));
        const expectedParams = {
            daoId,
            pluginAddress,
            prepareActions: {},
            values: { actions: [] },
        };
        expect(open).toHaveBeenCalledWith(GovernanceDialogs.PUBLISH_PROPOSAL, { params: expectedParams });
    });
});
