import * as DaoService from '@/shared/api/daoService';
import * as usePinJson from '@/shared/api/ipfsService/mutations';
import { type IDialogLocation } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogProps,
    type ITransactionDialogStep,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryMutationResultIdle,
    generateReactQueryMutationResultSuccess,
    generateReactQueryResultSuccess,
    generateTabComponentPlugin,
} from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import { GukModulesProvider, modulesCopy } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import { generateProposalCreate } from '../../testUtils';
import { PublishProposalDialog, type PublishProposalStep } from './publishProposalDialog';
import type { IPublishProposalDialogParams, IPublishProposalDialogProps } from './publishProposalDialog.api';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

jest.mock('@/shared/components/transactionDialog', () => ({
    TransactionDialog: jest.fn((props: { children: ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
}));

describe('<PublishProposalDialog /> component', () => {
    const useAccountSpy = jest.spyOn(Wagmi, 'useAccount');
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const usePinJsonSpy = jest.spyOn(usePinJson, 'usePinJson');
    const prepareMetadataSpy = jest.spyOn(publishProposalDialogUtils, 'prepareMetadata');
    const buildTransactionSpy = jest.spyOn(publishProposalDialogUtils, 'buildTransaction');

    beforeEach(() => {
        useAccountSpy.mockReturnValue({ address: '0x123' } as unknown as Wagmi.UseAccountReturnType);
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin()]);
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultIdle());
        buildTransactionSpy.mockReturnValue(Promise.resolve({ to: '0x123', data: '0x123', value: BigInt(0) }));
    });

    afterEach(() => {
        useAccountSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        usePinJsonSpy.mockReset();
        prepareMetadataSpy.mockReset();
        useDaoSpy.mockReset();
        (TransactionDialog as jest.Mock).mockClear();
    });

    const generateDialogLocation = (
        params?: Partial<IPublishProposalDialogParams>,
    ): IDialogLocation<IPublishProposalDialogParams> => ({
        id: 'test',
        params: {
            proposal: generateProposalCreate(),
            daoId: 'test',
            plugin: generateDaoPlugin(),
            ...params,
        },
    });

    const createTestComponent = (props?: Partial<IPublishProposalDialogProps>) => {
        const completeProps: IPublishProposalDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return (
            <GukModulesProvider>
                <PublishProposalDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('throws error when dialog parameters are not set', () => {
        testLogger.suppressErrors();
        const location = { id: 'test', params: undefined };
        expect(() => render(createTestComponent({ location }))).toThrow();
    });

    it('throws error when user is not connected', () => {
        testLogger.suppressErrors();
        const location = generateDialogLocation();
        useAccountSpy.mockReturnValue({ address: undefined } as Wagmi.UseAccountReturnType);
        expect(() => render(createTestComponent({ location }))).toThrow();
    });

    it('renders the dialog title and description', () => {
        const location = generateDialogLocation();
        render(createTestComponent({ location }));
        expect(TransactionDialog).toHaveBeenCalledWith(
            expect.objectContaining({
                title: expect.stringMatching(/publishProposalDialog.title/) as unknown,
                description: expect.stringMatching(/publishProposalDialog.description/) as unknown,
            }),
            undefined,
        );
    });

    it('renders a draft version of the proposal being created', () => {
        const proposal = generateProposalCreate({ title: 'Proposal title', summary: 'Proposal summary' });
        const location = generateDialogLocation({ proposal });
        useAccountSpy.mockReturnValue({
            address: '0xD740fd724D616795120BC363316580dAFf41129A',
        } as unknown as Wagmi.UseAccountReturnType);
        render(createTestComponent({ location }));
        expect(screen.getByText(modulesCopy.proposalDataListItemStatus.statusLabel.DRAFT)).toBeInTheDocument();
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
        expect(screen.getByText('0xD740…129A')).toBeInTheDocument();
    });

    it('set a custom step to pin the proposal metadata before preparing the transaction', () => {
        const parsedMetadata = {
            title: 'parsed-title',
            description: 'parsed-description',
            summary: 'summary',
            resources: [],
        };
        prepareMetadataSpy.mockReturnValue(parsedMetadata);

        const pinJson = jest.fn();
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultIdle({ mutate: pinJson }));
        const errorHandler = jest.fn();

        const proposal = generateProposalCreate({
            title: 'test-title',
            summary: 'test-summary',
            resources: [{ name: 'twitter', url: 'https://x.com/test' }],
            body: '<p>Body</p>',
        });
        const location = generateDialogLocation({ proposal });
        render(createTestComponent({ location }));

        const { customSteps } = (
            TransactionDialog as jest.Mock<ReactNode, Array<ITransactionDialogProps<PublishProposalStep>>>
        ).mock.calls[0][0];
        const pinMetadataStep: ITransactionDialogStep<PublishProposalStep> = customSteps![0];
        expect(pinMetadataStep.meta.label).toMatch(/publishProposalDialog.step.PIN_METADATA.label/);
        expect(pinMetadataStep.meta.errorLabel).toMatch(/publishProposalDialog.step.PIN_METADATA.errorLabel/);
        expect(pinMetadataStep.meta.state).toEqual('idle');

        act(() => pinMetadataStep.meta.action?.({ onError: errorHandler }));
        expect(prepareMetadataSpy).toHaveBeenCalledWith(proposal);
        expect(pinJson).toHaveBeenCalledWith({ body: parsedMetadata }, { onError: errorHandler });
    });

    it('prepares the transaction using the buildTransaction functionality and the hash of the pinned data', async () => {
        const daoPlugin = generateDaoPlugin();
        const ipfsResult = { IpfsHash: 'test' };
        const proposal = generateProposalCreate();
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: daoPlugin })]);
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultSuccess({ data: ipfsResult }));
        const location = generateDialogLocation({ proposal });
        render(createTestComponent({ location }));

        const { prepareTransaction } = (
            TransactionDialog as jest.Mock<ReactNode, Array<ITransactionDialogProps<PublishProposalStep>>>
        ).mock.calls[0][0];
        await act(() => prepareTransaction());

        expect(buildTransactionSpy).toHaveBeenCalledWith({
            proposal,
            metadataCid: ipfsResult.IpfsHash,
            plugin: daoPlugin,
        });
    });
});
