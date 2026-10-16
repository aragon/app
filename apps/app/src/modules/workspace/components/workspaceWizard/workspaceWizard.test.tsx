import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as blockNavigationContext from '@/shared/components/blockNavigationContext';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import { type IWorkspaceWizardProps, WorkspaceWizard } from './workspaceWizard';

describe('<WorkspaceWizard /> component', () => {
    const trackSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');
    const useBlockNavigationContextSpy = jest.spyOn(
        blockNavigationContext,
        'useBlockNavigationContext',
    );

    beforeEach(() => {
        trackSpy.mockImplementation(() => undefined);
        useBlockNavigationContextSpy.mockReturnValue({
            isBlocked: false,
            setIsBlocked: jest.fn(),
        });
    });

    afterEach(() => {
        trackSpy.mockReset();
        useBlockNavigationContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWorkspaceWizardProps>) => {
        const completeProps: IWorkspaceWizardProps = {
            translationNamespace: 'app.test',
            analyticsFlow: 'test_flow',
            onSubmit: jest.fn(),
            defaultValues: {
                name: 'Demo Workspace',
                description: '',
                resources: [],
                targets: [],
                accounts: [],
            },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <WorkspaceWizard {...completeProps} />
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    const clickNext = async () =>
        userEvent.click(
            screen.getByRole('button', { name: /wizard.footer.next/ }),
        );

    it('opens on the first step, using the copy of the translation namespace', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('heading', {
                level: 1,
                name: 'app.test.steps.METADATA.title',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('app.test.steps.METADATA.description'),
        ).toBeInTheDocument();
    });

    it('opens on the initial active step when set', () => {
        render(
            createTestComponent({
                initialActiveStep: WorkspaceWizardStep.ACCOUNTS,
            }),
        );

        expect(
            screen.getByRole('heading', {
                level: 1,
                name: 'app.test.steps.ACCOUNTS.title',
            }),
        ).toBeInTheDocument();
    });

    it('tracks the submit and calls onSubmit with the values once the last step is submitted', async () => {
        const onSubmit = jest.fn();
        render(createTestComponent({ onSubmit }));

        await clickNext();
        await clickNext();
        await userEvent.click(
            screen.getByRole('button', { name: 'app.test.submitLabel' }),
        );

        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Demo Workspace' }),
            ),
        );
        expect(trackSpy).toHaveBeenCalledWith('wizard_submit', {
            flow: 'test_flow',
            accounts: 0,
            targets: 0,
            hasAvatar: false,
        });
    });
});
