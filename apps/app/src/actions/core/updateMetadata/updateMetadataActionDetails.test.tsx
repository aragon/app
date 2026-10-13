import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import {
    generateProposalActionUpdateMetadata,
    generateProposalActionUpdatePluginMetadata,
} from '@/modules/governance/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type IUpdateMetadataActionDetailsProps,
    UpdateMetadataActionDetails,
} from './updateMetadataActionDetails';

describe('<UpdateMetadataActionDetails /> component', () => {
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');

    afterEach(() => {
        cidToSrcSpy.mockReset();
    });

    const buildAction = (action: IProposalAction): IProposalActionData => ({
        ...action,
        daoId: 'dao-id',
        meta: undefined,
    });

    const createTestComponent = (
        props?: Partial<IUpdateMetadataActionDetailsProps>,
    ) => {
        const completeProps: IUpdateMetadataActionDetailsProps = {
            action: buildAction(generateProposalActionUpdateMetadata()),
            index: 0,
            ...props,
        };

        return <UpdateMetadataActionDetails {...completeProps} />;
    };

    it('renders the proposed metadata by default and the existing metadata when toggled', async () => {
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                name: 'Proposed name',
                description: 'Proposed description',
                links: [{ name: 'Proposed link', url: 'https://proposed.com' }],
            },
            existingMetadata: {
                name: 'Existing name',
                description: 'Existing description',
                links: [{ name: 'Existing link', url: 'https://existing.com' }],
            },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.getByText('Proposed name')).toBeInTheDocument();
        expect(screen.getByText('Proposed description')).toBeInTheDocument();
        expect(screen.getByText('Proposed link')).toBeInTheDocument();

        await userEvent.click(
            screen.getByText(
                'app.actions.core.updateMetadataActionDetails.existingToggle',
            ),
        );

        expect(screen.getByText('Existing name')).toBeInTheDocument();
        expect(screen.getByText('Existing description')).toBeInTheDocument();
        expect(screen.getByText('Existing link')).toBeInTheDocument();
    });

    it('renders the logo and description terms for DAO metadata and resolves the avatar from IPFS', () => {
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                avatar: 'ipfs://avatar-cid',
                name: 'Proposed name',
                description: 'Proposed description',
                links: [],
            },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(
            screen.getByText(
                'app.actions.core.updateMetadataActionDetails.logoTerm',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.actions.core.updateMetadataActionDetails.descriptionTerm',
            ),
        ).toBeInTheDocument();
        expect(cidToSrcSpy).toHaveBeenCalledWith('ipfs://avatar-cid');
    });

    it('renders the summary and process key terms for plugin metadata with a process key', () => {
        const action = generateProposalActionUpdatePluginMetadata({
            proposedMetadata: {
                name: 'Core',
                processKey: 'CRE',
                description: 'Proposed summary',
            },
            existingMetadata: { name: 'Core', processKey: 'COR' },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(
            screen.queryByText(
                'app.actions.core.updateMetadataActionDetails.logoTerm',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.actions.core.updateMetadataActionDetails.summaryTerm',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.actions.core.updateMetadataActionDetails.processKeyTerm',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('CRE')).toBeInTheDocument();
    });

    it('does not render the process key term when the existing plugin metadata has no process key', () => {
        const action = generateProposalActionUpdatePluginMetadata({
            proposedMetadata: { name: 'Council', processKey: 'CNL' },
            existingMetadata: { name: 'Council' },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(
            screen.queryByText(
                'app.actions.core.updateMetadataActionDetails.processKeyTerm',
            ),
        ).not.toBeInTheDocument();
    });
});
