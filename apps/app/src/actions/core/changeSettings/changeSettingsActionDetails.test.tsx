import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    type IProposalActionChangeSettings,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { generateProposalAction } from '@/modules/governance/testUtils';
import {
    ChangeSettingsActionDetails,
    type IChangeSettingsActionDetailsProps,
} from './changeSettingsActionDetails';

describe('<ChangeSettingsActionDetails /> component', () => {
    const buildAction = (
        action?: Partial<IProposalActionChangeSettings>,
    ): IProposalActionData => ({
        ...generateProposalAction(),
        type: ProposalActionType.CHANGE_SETTINGS,
        proposedSettings: [],
        existingSettings: [],
        ...action,
        daoId: 'dao-id',
        meta: undefined,
    });

    const createTestComponent = (
        props?: Partial<IChangeSettingsActionDetailsProps>,
    ) => {
        const completeProps: IChangeSettingsActionDetailsProps = {
            action: buildAction(),
            index: 0,
            ...props,
        };

        return <ChangeSettingsActionDetails {...completeProps} />;
    };

    const copyKey = (key: string) =>
        `app.actions.core.changeSettingsActionDetails.${key}`;

    it('renders the proposed and existing toggles', () => {
        render(createTestComponent());
        expect(screen.getByText(copyKey('proposedToggle'))).toBeInTheDocument();
        expect(screen.getByText(copyKey('existingToggle'))).toBeInTheDocument();
    });

    it('renders the proposed settings by default', () => {
        const action = buildAction({
            existingSettings: [
                { term: 'Support threshold', definition: '50%' },
            ],
            proposedSettings: [
                { term: 'Support threshold', definition: '60%' },
            ],
        });

        render(createTestComponent({ action }));

        expect(screen.getByText('Support threshold')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument();
        expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('renders every setting of the displayed side and switches to the existing settings when toggled', async () => {
        const proposedSettings = [
            { term: 'Proposed term 1', definition: 'Proposed definition 1' },
            { term: 'Proposed term 2', definition: 'Proposed definition 2' },
        ];
        const existingSettings = [
            { term: 'Existing term 1', definition: 'Existing definition 1' },
            { term: 'Existing term 2', definition: 'Existing definition 2' },
        ];
        const action = buildAction({ proposedSettings, existingSettings });

        render(createTestComponent({ action }));

        for (const { term, definition } of proposedSettings) {
            expect(screen.getByText(term)).toBeInTheDocument();
            expect(screen.getByText(definition)).toBeInTheDocument();
        }
        expect(screen.getAllByRole('term')).toHaveLength(2);
        expect(screen.queryByText('Existing term 1')).not.toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        for (const { term, definition } of existingSettings) {
            expect(screen.getByText(term)).toBeInTheDocument();
            expect(screen.getByText(definition)).toBeInTheDocument();
        }
        expect(screen.queryByText('Proposed term 1')).not.toBeInTheDocument();
    });

    it('keeps the current settings displayed when the selected toggle is clicked again', async () => {
        const action = buildAction({
            proposedSettings: [{ term: 'Threshold', definition: '3' }],
            existingSettings: [{ term: 'Threshold', definition: '2' }],
        });

        render(createTestComponent({ action }));

        await userEvent.click(screen.getByText(copyKey('proposedToggle')));
        expect(screen.getByText('3')).toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));
        await userEvent.click(screen.getByText(copyKey('existingToggle')));
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('swaps only the definitions when both sides share the same terms, including unchanged settings', async () => {
        const action = buildAction({
            existingSettings: [
                { term: 'Approval threshold', definition: '> 50%' },
                {
                    term: 'Minimum participation',
                    definition: '≥ 15% (≥ 300.5K UNI)',
                },
                {
                    term: 'Minimum duration',
                    definition: '3 days, 0 hours, 0 minutes',
                },
            ],
            proposedSettings: [
                { term: 'Approval threshold', definition: '> 55%' },
                {
                    term: 'Minimum participation',
                    definition: '≥ 15% (≥ 300.5K UNI)',
                },
                {
                    term: 'Minimum duration',
                    definition: '1 days, 12 hours, 0 minutes',
                },
            ],
        });
        const terms = () =>
            screen.getAllByRole('term').map((term) => term.textContent);
        const expectedTerms = [
            'Approval threshold',
            'Minimum participation',
            'Minimum duration',
        ];

        render(createTestComponent({ action }));

        expect(terms()).toEqual(expectedTerms);
        expect(screen.getByText('> 55%')).toBeInTheDocument();
        expect(screen.getByText('≥ 15% (≥ 300.5K UNI)')).toBeInTheDocument();
        expect(
            screen.getByText('1 days, 12 hours, 0 minutes'),
        ).toBeInTheDocument();

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(terms()).toEqual(expectedTerms);
        expect(screen.getByText('> 50%')).toBeInTheDocument();
        expect(screen.getByText('≥ 15% (≥ 300.5K UNI)')).toBeInTheDocument();
        expect(
            screen.getByText('3 days, 0 hours, 0 minutes'),
        ).toBeInTheDocument();
        expect(screen.queryByText('> 55%')).not.toBeInTheDocument();
    });

    it('renders no settings when the lists are empty', () => {
        render(createTestComponent());
        expect(screen.queryByRole('term')).not.toBeInTheDocument();
    });
});
