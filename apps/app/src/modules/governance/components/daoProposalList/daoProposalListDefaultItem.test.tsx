import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { WorkspaceBaseUrlProvider } from '@/shared/components/workspaceBaseUrlProvider';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { generateProposal } from '../../testUtils';
import { proposalUtils } from '../../utils/proposalUtils';
import {
    DaoProposalListDefaultItem,
    type IDaoProposalListDefaultItemProps,
} from './daoProposalListDefaultItem';

describe('<DaoProposalListDefaultItem /> component', () => {
    const useSlotSingleFunctionSpy = jest.spyOn(
        useSlotSingleFunction,
        'useSlotSingleFunction',
    );
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
    });

    afterEach(() => {
        useSlotSingleFunctionSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useDaoSpy.mockReset();
    });

    const defaultDao = generateDao({
        address: '0x123',
        plugins: [generateDaoPlugin()],
    });

    const createTestComponent = (
        props?: Partial<IDaoProposalListDefaultItemProps>,
    ) => {
        const completeProps: IDaoProposalListDefaultItemProps = {
            proposal: generateProposal(),
            dao: defaultDao,
            proposalSlug: 'admin-1',
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoProposalListDefaultItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the proposal info', () => {
        const proposal = generateProposal({
            title: 'my-proposal',
            summary: 'proposal-summary',
        });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
    });

    it('renders a warning when the proposal metadata is a non-standard string', () => {
        const proposal = generateProposal({
            title: '',
            summary: '',
            description: '',
            metadataUri: 'raw-metadata-string',
        });
        render(createTestComponent({ proposal }));
        expect(
            screen.getByText(
                'app.governance.proposalMetadataAlert.nonStandard',
            ),
        ).toBeInTheDocument();
    });

    it('renders a warning when the proposal metadata is missing', () => {
        const proposal = generateProposal({
            title: '',
            summary: '',
            description: '',
            metadataUri: null,
        });
        render(createTestComponent({ proposal, proposalSlug: 'ADMIN-2' }));
        expect(
            screen.getByText('app.governance.proposalMetadataAlert.missing'),
        ).toBeInTheDocument();
        expect(screen.getByText('ADMIN-2')).toBeInTheDocument();
    });

    it('renders the proposal identifier once when the title is empty', () => {
        const proposal = generateProposal({ title: '', summary: '' });
        render(createTestComponent({ proposal, proposalSlug: 'ADMIN-2' }));
        expect(screen.getByText('ADMIN-2')).toBeInTheDocument();
    });

    it('uses the plugin slot-function to process the proposal status', () => {
        const status = ProposalStatus.EXECUTABLE;
        useSlotSingleFunctionSpy.mockReturnValue(status);
        render(createTestComponent());
        expect(screen.getByText(/Executable/)).toBeInTheDocument();
    });

    it('displays the tag when set, used by the workspace list to name the DAO of the row', () => {
        render(createTestComponent({ tag: 'Demo DAO' }));
        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
    });

    it('displays no tag by default, the DAO pages show one proposal source at a time', () => {
        render(createTestComponent());
        expect(screen.queryByText('Demo DAO')).not.toBeInTheDocument();
    });
    it('builds the proposal link from the DAO by default, as on the DAO pages', () => {
        const getProposalUrlSpy = jest.spyOn(proposalUtils, 'getProposalUrl');
        const proposal = generateProposal();
        render(createTestComponent({ proposal }));

        expect(getProposalUrlSpy).toHaveBeenCalledWith(
            proposal,
            defaultDao,
            undefined,
        );
        getProposalUrlSpy.mockRestore();
    });

    it('builds the proposal link under the workspace when rendered inside one', () => {
        const getProposalUrlSpy = jest.spyOn(proposalUtils, 'getProposalUrl');
        const proposal = generateProposal();
        render(
            <WorkspaceBaseUrlProvider baseUrl="/workspace/demo">
                {createTestComponent({ proposal })}
            </WorkspaceBaseUrlProvider>,
        );

        expect(getProposalUrlSpy).toHaveBeenCalledWith(
            proposal,
            defaultDao,
            '/workspace/demo',
        );
        getProposalUrlSpy.mockRestore();
    });
});
