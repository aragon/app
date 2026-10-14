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

    const copyKey = (key: string) =>
        `app.actions.core.updateMetadataActionDetails.${key}`;

    it('renders the proposed and existing toggles', () => {
        render(createTestComponent());
        expect(screen.getByText(copyKey('proposedToggle'))).toBeInTheDocument();
        expect(screen.getByText(copyKey('existingToggle'))).toBeInTheDocument();
    });

    it('renders the proposed metadata by default and the existing metadata when toggled', async () => {
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                name: 'Proposed name',
                description: 'Proposed description',
                links: [
                    { name: 'Proposed link 1', url: 'https://proposed-1.com' },
                    { name: 'Proposed link 2', url: 'https://proposed-2.com' },
                ],
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
        expect(
            screen.getByRole('link', { name: /Proposed link 1/ }),
        ).toHaveAttribute('href', 'https://proposed-1.com');
        expect(
            screen.getByRole('link', { name: /Proposed link 2/ }),
        ).toHaveAttribute('href', 'https://proposed-2.com');
        expect(screen.queryByText('Existing name')).not.toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.getByText('Existing name')).toBeInTheDocument();
        expect(screen.getByText('Existing description')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /Existing link/ }),
        ).toHaveAttribute('href', 'https://existing.com');
        expect(screen.queryByText('Proposed name')).not.toBeInTheDocument();
    });

    it('renders the DAO metadata terms', () => {
        render(createTestComponent());

        expect(screen.getByText(copyKey('logoTerm'))).toBeInTheDocument();
        expect(screen.getByText(copyKey('nameTerm'))).toBeInTheDocument();
        expect(
            screen.getByText(copyKey('descriptionTerm')),
        ).toBeInTheDocument();
        expect(screen.getByText(copyKey('linkTerm'))).toBeInTheDocument();
        expect(
            screen.queryByText(copyKey('summaryTerm')),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(copyKey('processKeyTerm')),
        ).not.toBeInTheDocument();
    });

    it('resolves the avatar of the displayed DAO metadata from IPFS', async () => {
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                avatar: 'ipfs://proposed-cid',
                name: 'Proposed name',
                description: 'Proposed description',
                links: [],
            },
            existingMetadata: {
                avatar: 'ipfs://existing-cid',
                name: 'Existing name',
                description: 'Existing description',
                links: [],
            },
        });

        render(createTestComponent({ action: buildAction(action) }));
        expect(cidToSrcSpy).toHaveBeenLastCalledWith('ipfs://proposed-cid');

        await userEvent.click(screen.getByText(copyKey('existingToggle')));
        expect(cidToSrcSpy).toHaveBeenLastCalledWith('ipfs://existing-cid');
    });

    it('does not resolve an avatar when the DAO metadata has none', () => {
        render(createTestComponent());
        expect(cidToSrcSpy).toHaveBeenCalledWith(undefined);
    });

    it('renders the plugin metadata terms and the process key of the displayed metadata', async () => {
        const action = generateProposalActionUpdatePluginMetadata({
            proposedMetadata: {
                name: 'Core',
                processKey: 'CRE',
                description: 'Proposed summary',
            },
            existingMetadata: { name: 'Core', processKey: 'COR' },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.queryByText(copyKey('logoTerm'))).not.toBeInTheDocument();
        expect(
            screen.queryByText(copyKey('descriptionTerm')),
        ).not.toBeInTheDocument();
        expect(screen.getByText(copyKey('summaryTerm'))).toBeInTheDocument();
        expect(screen.getByText(copyKey('processKeyTerm'))).toBeInTheDocument();
        expect(screen.getByText('CRE')).toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.getByText('COR')).toBeInTheDocument();
    });

    it('does not render the process key term when the existing plugin metadata has no process key', () => {
        const action = generateProposalActionUpdatePluginMetadata({
            proposedMetadata: { name: 'Council', processKey: 'CNL' },
            existingMetadata: { name: 'Council' },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(
            screen.queryByText(copyKey('processKeyTerm')),
        ).not.toBeInTheDocument();
    });

    it('renders plugin metadata with missing fields', async () => {
        const action = generateProposalActionUpdatePluginMetadata({
            proposedMetadata: {},
            existingMetadata: {},
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.getByText(copyKey('nameTerm'))).toBeInTheDocument();
        expect(screen.getByText(copyKey('linkTerm'))).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('keeps the current metadata displayed when the selected toggle is clicked again', async () => {
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                name: 'Proposed name',
                description: 'Proposed description',
                links: [],
            },
            existingMetadata: {
                name: 'Existing name',
                description: 'Existing description',
                links: [],
            },
        });

        render(createTestComponent({ action: buildAction(action) }));

        await userEvent.click(screen.getByText(copyKey('proposedToggle')));
        expect(screen.getByText('Proposed name')).toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));
        await userEvent.click(screen.getByText(copyKey('existingToggle')));
        expect(screen.getByText('Existing name')).toBeInTheDocument();
    });

    it('renders DAO metadata with missing fields', async () => {
        const action = {
            ...generateProposalActionUpdateMetadata(),
            proposedMetadata: { name: 'Proposed name' },
            existingMetadata: {},
        } as unknown as IProposalAction;

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.getByText('Proposed name')).toBeInTheDocument();
        expect(screen.getByText(copyKey('logoTerm'))).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(cidToSrcSpy).toHaveBeenLastCalledWith(undefined);

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.queryByText('Proposed name')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders the process key term with an empty value when only the existing plugin metadata has a process key', async () => {
        const action = generateProposalActionUpdatePluginMetadata({
            proposedMetadata: { name: 'Core' },
            existingMetadata: { name: 'Core', processKey: 'COR' },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.getByText(copyKey('processKeyTerm'))).toBeInTheDocument();
        expect(screen.queryByText('COR')).not.toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.getByText('COR')).toBeInTheDocument();
    });

    it('renders the link URL when a link has no name', () => {
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                name: 'Proposed name',
                description: 'Proposed description',
                links: [{ name: '', url: 'https://unnamed.com' }],
            },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://unnamed.com',
        );
        expect(screen.getByText('https://unnamed.com')).toBeInTheDocument();
    });

    it('renders every link when links share the same URL', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                name: 'Proposed name',
                description: 'Proposed description',
                links: [
                    { name: 'Website', url: 'https://same.com' },
                    { name: 'Docs', url: 'https://same.com' },
                ],
            },
            existingMetadata: {
                name: 'Existing name',
                description: 'Existing description',
                links: [{ name: 'Website', url: 'https://same.com' }],
            },
        });

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.getAllByRole('link')).toHaveLength(2);

        await userEvent.click(screen.getByText(copyKey('existingToggle')));
        expect(screen.getAllByRole('link')).toHaveLength(1);

        await userEvent.click(screen.getByText(copyKey('proposedToggle')));
        expect(screen.getAllByRole('link')).toHaveLength(2);

        const duplicateKeyWarnings = consoleErrorSpy.mock.calls.filter(
            ([message]) =>
                typeof message === 'string' && message.includes('same key'),
        );
        expect(duplicateKeyWarnings).toHaveLength(0);
    });

    it('renders empty fields when the action metadata is null', async () => {
        const action = {
            ...generateProposalActionUpdatePluginMetadata(),
            proposedMetadata: null,
            existingMetadata: null,
        } as unknown as IProposalAction;

        render(createTestComponent({ action: buildAction(action) }));

        expect(screen.getByText(copyKey('nameTerm'))).toBeInTheDocument();
        expect(
            screen.queryByText(copyKey('processKeyTerm')),
        ).not.toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.getByText(copyKey('nameTerm'))).toBeInTheDocument();
    });
});
