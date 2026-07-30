import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as connectedWalletGuard from '@/modules/application/hooks/useConnectedWalletGuard';
import { Network } from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { analyticsUtils } from '@/shared/utils/analyticsUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import { CreateDaoDialogId } from '../../constants/createDaoDialogId';
import { CreateDaoPageClient } from './createDaoPageClient';

const daoFormValues = {
    name: 'Test DAO',
    description: 'Description',
    ens: 'test-dao',
    network: Network.ETHEREUM_SEPOLIA,
    resources: [],
    avatar: { file: new File(['avatar'], 'avatar.png') },
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
                onSubmit: (values: typeof daoFormValues) => void;
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
                            onSubmit(daoFormValues);
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

jest.mock('../../components/createDaoForm', () => ({
    CreateDaoForm: {
        Debug: () => null,
        Metadata: () => null,
        Network: () => null,
    },
}));

describe('<CreateDaoPageClient /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useConnectedWalletGuardSpy = jest.spyOn(
        connectedWalletGuard,
        'useConnectedWalletGuard',
    );
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');
    const trackEventSpy = jest.spyOn(analyticsUtils, 'trackEvent');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useConnectedWalletGuardSpy.mockReturnValue({
            check: (params) => params?.onSuccess?.(),
            result: true,
        });
        trackAnalyticsSpy.mockImplementation(() => undefined);
        trackEventSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useConnectedWalletGuardSpy.mockReset();
        trackAnalyticsSpy.mockReset();
        trackEventSpy.mockReset();
    });

    it('tracks create-DAO wizard start once on render', async () => {
        render(<CreateDaoPageClient />);

        await waitFor(() =>
            expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_start', {
                flow: 'create_dao',
            }),
        );
    });

    it('tracks create-DAO wizard submit when the wallet guard opens the publish dialog', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));

        render(<CreateDaoPageClient />);
        await userEvent.click(screen.getByTestId('submit'));

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_submit', {
            flow: 'create_dao',
            network: daoFormValues.network,
            hasEns: true,
            hasAvatar: true,
        });
        expect(trackEventSpy).not.toHaveBeenCalled();
        expect(open).toHaveBeenCalledWith(CreateDaoDialogId.PUBLISH_DAO, {
            params: { values: daoFormValues },
        });
    });
});
