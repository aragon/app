import * as DaoService from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import * as wagmi from 'wagmi';
import { GovernanceDialog } from '../../constants/moduleDialogs';
import { CreateProposalPageClient, type ICreateProposalPageClientProps } from './createProposalPageClient';

jest.mock('./createProposalPageClientSteps', () => ({
    CreateProposalPageClientSteps: () => <button data-testid="steps-mock" type="submit" />,
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('<CreateProposalPageClient /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn(), updateOptions: jest.fn() });
        useRouterSpy.mockReturnValue({
            push: jest.fn(),
            prefetch: jest.fn(),
        } as unknown as AppRouterInstance);
        useAccountSpy.mockReturnValue({} as wagmi.UseAccountReturnType);
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useRouterSpy.mockReset();
        useAccountSpy.mockReset();
        useDaoSpy.mockReset();
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
        useDialogContextSpy.mockReturnValue({ open, close: jest.fn(), updateOptions: jest.fn() });
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
        expect(open).toHaveBeenCalledWith(GovernanceDialog.PUBLISH_PROPOSAL, { params: expectedParams });
    });
});
