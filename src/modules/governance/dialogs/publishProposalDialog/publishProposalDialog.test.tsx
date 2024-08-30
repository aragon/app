import { TransactionDialog } from '@/shared/components/transactionDialog';
import * as useSupportedDaoPlugin from '@/shared/hooks/useSupportedDaoPlugin';
import { testLogger } from '@/test/utils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import { generateCreateProposalFormData } from '../../testUtils';
import { type IPublishProposalDialogProps, PublishProposalDialog } from './publishProposalDialog';

jest.mock('@/shared/components/transactionDialog', () => ({
    TransactionDialog: jest.fn((props: { children: ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
}));

describe('<PublishProposalDialog /> component', () => {
    const useAccountSpy = jest.spyOn(Wagmi, 'useAccount');
    const useSupportedDaoPluginSpy = jest.spyOn(useSupportedDaoPlugin, 'useSupportedDaoPlugin');

    beforeEach(() => {
        useAccountSpy.mockReturnValue({} as Wagmi.UseAccountReturnType);
        useSupportedDaoPluginSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        useAccountSpy.mockReset();
        useSupportedDaoPluginSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPublishProposalDialogProps>) => {
        const completeProps: IPublishProposalDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return (
            <OdsModulesProvider>
                <PublishProposalDialog {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('throws error when dialog parameters are not set', () => {
        testLogger.suppressErrors();
        const location = { id: 'test', params: undefined };
        expect(() => render(createTestComponent({ location }))).toThrow();
    });

    it('renders the dialog title and description', () => {
        const params = { values: generateCreateProposalFormData(), daoId: 'test' };
        const location = { id: '', params };
        render(createTestComponent({ location }));
        expect(TransactionDialog).toHaveBeenCalledWith(
            expect.objectContaining({
                title: expect.stringMatching(/publishProposalDialog.title/),
                description: expect.stringMatching(/publishProposalDialog.description/),
            }),
            expect.anything(),
        );
    });

    it('renders a draft version of the proposal being created', () => {
        const values = generateCreateProposalFormData({ title: 'Proposal title', summary: 'Proposal summary' });
        const location = { id: '', params: { values, daoId: 'test' } };
        useAccountSpy.mockReturnValue({
            address: '0xD740fd724D616795120BC363316580dAFf41129A',
        } as unknown as Wagmi.UseAccountReturnType);
        render(createTestComponent({ location }));
        expect(screen.getByText('Draft')).toBeInTheDocument();
        expect(screen.getByText(values.title)).toBeInTheDocument();
        expect(screen.getByText(values.summary)).toBeInTheDocument();
        expect(screen.getByText('0xD7…129A')).toBeInTheDocument();
    });
});
