import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as executePermissionGuard from '@/modules/governance/hooks/useExecutePermissionCheckGuard';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import { CreateExecuteActionsPageClient } from './createExecuteActionsPageClient';

const executeFormValues = {
    actions: [
        {
            type: 'withdraw',
            from: '0x0',
            to: '0x1',
            data: '0x',
            value: '0',
        },
    ],
};

jest.mock('@/shared/components/wizards/wizardPage', () => {
    const { plausibleAnalyticsUtils } = jest.requireActual(
        '@/shared/utils/plausibleAnalyticsUtils',
    );

    return {
        WizardPage: {
            Container: ({
                analytics,
                children,
                onSubmit,
            }: {
                analytics?: {
                    flow: string;
                    props?: Record<string, string | number | boolean>;
                };
                children: React.ReactNode;
                onSubmit: (values: typeof executeFormValues) => void;
            }) => {
                if (analytics != null) {
                    plausibleAnalyticsUtils.track('wizard_start', {
                        ...analytics.props,
                        flow: analytics.flow,
                    });
                }

                return (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            onSubmit(executeFormValues);
                        }}
                    >
                        {children}
                        <button data-testid="submit" type="submit" />
                    </form>
                );
            },
            Step: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
        },
    };
});

jest.mock('./createExecuteActionsPageClientSteps', () => ({
    CreateExecuteActionsPageClientSteps: () => null,
}));

describe('<CreateExecuteActionsPageClient /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useExecutePermissionCheckGuardSpy = jest.spyOn(
        executePermissionGuard,
        'useExecutePermissionCheckGuard',
    );
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useExecutePermissionCheckGuardSpy.mockImplementation(() => undefined);
        trackAnalyticsSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useExecutePermissionCheckGuardSpy.mockReset();
        trackAnalyticsSpy.mockReset();
    });

    it('tracks direct-execute wizard start on render', async () => {
        render(<CreateExecuteActionsPageClient daoId="dao-id" />);

        await waitFor(() =>
            expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_start', {
                flow: 'direct_execute_actions',
            }),
        );
    });

    it('tracks direct-execute wizard submit with action count', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));

        render(<CreateExecuteActionsPageClient daoId="dao-id" />);
        await userEvent.click(screen.getByTestId('submit'));

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_submit', {
            flow: 'direct_execute_actions',
            actionCount: executeFormValues.actions.length,
        });
        expect(open).toHaveBeenCalledWith(GovernanceDialogId.EXECUTE_ACTIONS, {
            params: {
                daoId: 'dao-id',
                actions: executeFormValues.actions,
                prepareActions: {},
            },
        });
    });
});
