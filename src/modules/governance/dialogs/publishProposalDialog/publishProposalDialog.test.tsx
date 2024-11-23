import * as usePinJson from '@/shared/api/ipfsService/mutations';
import { type IDialogLocation } from '@/shared/components/dialogProvider';
import { type ITransactionDialogStep, TransactionDialog } from '@/shared/components/transactionDialog';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateReactQueryMutationResultIdle,
    generateReactQueryMutationResultSuccess,
    generateTabComponentPlugin,
} from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import { GukModulesProvider, modulesCopy } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import * as Wagmi from 'wagmi';
import { generateCreateProposalFormData } from '../../testUtils';
import {
    type IPublishProposalDialogParams,
    type IPublishProposalDialogProps,
    PublishProposalDialog,
    type PublishProposalStep,
} from './publishProposalDialog';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

jest.mock('@/shared/components/transactionDialog', () => ({
    TransactionDialog: jest.fn((props: { children: ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
}));

describe('<PublishProposalDialog /> component', () => {
    const useAccountSpy = jest.spyOn(Wagmi, 'useAccount');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const usePinJsonSpy = jest.spyOn(usePinJson, 'usePinJson');
    const prepareMetadataSpy = jest.spyOn(publishProposalDialogUtils, 'prepareMetadata');
    const buildTransactionSpy = jest.spyOn(publishProposalDialogUtils, 'buildTransaction');
    const getProposalIdSpy = jest.spyOn(publishProposalDialogUtils, 'getProposalId');

    beforeEach(() => {
        useAccountSpy.mockReturnValue({ address: '0x123' } as unknown as Wagmi.UseAccountReturnType);
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin()]);
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultIdle());
        buildTransactionSpy.mockReturnValue({});
    });

    afterEach(() => {
        useAccountSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        usePinJsonSpy.mockReset();
        prepareMetadataSpy.mockReset();
        getProposalIdSpy.mockReset();
        (TransactionDialog as jest.Mock).mockClear();
    });

    const generateDialogLocation = (
        params?: Partial<IPublishProposalDialogParams>,
    ): IDialogLocation<IPublishProposalDialogParams> => ({
        id: 'test',
        params: {
            values: generateCreateProposalFormData(),
            daoId: 'test',
            pluginAddress: '0x123',
            prepareActions: {},
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
                title: expect.stringMatching(/publishProposalDialog.title/),
                description: expect.stringMatching(/publishProposalDialog.description/),
            }),
            undefined,
        );
    });

    it('renders a draft version of the proposal being created', () => {
        const values = generateCreateProposalFormData({ title: 'Proposal title', summary: 'Proposal summary' });
        const location = generateDialogLocation({ values });
        useAccountSpy.mockReturnValue({
            address: '0xD740fd724D616795120BC363316580dAFf41129A',
        } as unknown as Wagmi.UseAccountReturnType);
        render(createTestComponent({ location }));
        expect(screen.getByText(modulesCopy.proposalDataListItemStatus.statusLabel.DRAFT)).toBeInTheDocument();
        expect(screen.getByText(values.title)).toBeInTheDocument();
        expect(screen.getByText(values.summary)).toBeInTheDocument();
        expect(screen.getByText('0xD7…129A')).toBeInTheDocument();
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

        const values = generateCreateProposalFormData({
            title: 'test-title',
            summary: 'test-summary',
            resources: [{ name: 'twitter', url: 'https://x.com/test' }],
            body: '<p>Body</p>',
        });
        const location = generateDialogLocation({ values });
        render(createTestComponent({ location }));

        const { customSteps } = (TransactionDialog as jest.Mock).mock.calls[0][0];
        const pinMetadataStep: ITransactionDialogStep<PublishProposalStep> = customSteps[0];
        expect(pinMetadataStep.meta.label).toMatch(/publishProposalDialog.step.PIN_METADATA.label/);
        expect(pinMetadataStep.meta.errorLabel).toMatch(/publishProposalDialog.step.PIN_METADATA.errorLabel/);
        expect(pinMetadataStep.meta.state).toEqual('idle');

        act(() => pinMetadataStep.meta.action?.({ onError: errorHandler }));
        expect(prepareMetadataSpy).toHaveBeenCalledWith(values);
        expect(pinJson).toHaveBeenCalledWith({ body: parsedMetadata }, { onError: errorHandler });
    });

    it('prepares the transaction using the buildTransaction functionality and the hash of the pinned data', async () => {
        const daoPlugin = generateDaoPlugin();
        const ipfsResult = { IpfsHash: 'test' };
        const values = generateCreateProposalFormData();
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: daoPlugin })]);
        usePinJsonSpy.mockReturnValue(generateReactQueryMutationResultSuccess({ data: ipfsResult }));
        const location = generateDialogLocation({ values });
        render(createTestComponent({ location }));

        const { prepareTransaction } = (TransactionDialog as jest.Mock).mock.calls[0][0];
        await act(() => prepareTransaction());

        expect(buildTransactionSpy).toHaveBeenCalledWith({
            values,
            metadataCid: ipfsResult.IpfsHash,
            plugin: daoPlugin,
        });
    });

    it('correctly builds the proposal-link from the transaction receipt', () => {
        const txReceipt = { transactionHash: '0xhash' };
        const proposalId = '5';
        const pluginAddress = '0x47283974';
        const daoId = 'my-dao';
        getProposalIdSpy.mockReturnValue(proposalId);

        const location = generateDialogLocation({ daoId, pluginAddress });
        render(createTestComponent({ location }));

        const { successLink } = (TransactionDialog as jest.Mock).mock.calls[0][0];
        const proposalLink = successLink.href(txReceipt);
        expect(proposalLink).toEqual(
            `/dao/${daoId}/proposals/${txReceipt.transactionHash}-${pluginAddress}-${proposalId}`,
        );
    });
});
