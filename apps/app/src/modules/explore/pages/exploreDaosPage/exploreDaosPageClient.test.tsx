import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as Wagmi from 'wagmi';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import * as CmsService from '@/shared/api/cmsService';
import { Network } from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import {
    generateDialogContext,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { analyticsUtils } from '@/shared/utils/analyticsUtils';
import {
    ExploreDaosPageClient,
    type IExploreDaosPageClientProps,
} from './exploreDaosPageClient';

jest.mock('../../components/daoList', () => ({
    DaoList: () => <div data-testid="dao-list-mock" />,
}));

jest.mock('@/modules/application/components/supportChat', () => ({
    SupportChatTrigger: () => <div data-testid="support-chat-trigger-mock" />,
}));

describe('<ExploreDaosPageClient /> component', () => {
    const useConnectionSpy = jest.spyOn(Wagmi, 'useConnection');
    const useDialogContextSpy = jest.spyOn(
        useDialogContext,
        'useDialogContext',
    );
    const useFeaturedDaosSpy = jest.spyOn(CmsService, 'useFeaturedDaos');
    const trackEventSpy = jest.spyOn(analyticsUtils, 'trackEvent');
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    beforeEach(() => {
        useFeatureFlagsSpy.mockReturnValue({
            snapshot: [],
            isEnabled: () => false,
            setOverride: jest.fn(),
        });
        useConnectionSpy.mockReturnValue({} as Wagmi.UseConnectionReturnType);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useFeaturedDaosSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: [] }),
        );
        trackEventSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDialogContextSpy.mockReset();
        useFeaturedDaosSpy.mockReset();
        trackEventSpy.mockReset();
        useFeatureFlagsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IExploreDaosPageClientProps>,
    ) => {
        const completeProps: IExploreDaosPageClientProps = {
            initialParams: {
                queryParams: { networks: [Network.ETHEREUM_MAINNET] },
            },
            ...props,
        };

        return (
            <GukModulesProvider>
                <ExploreDaosPageClient {...completeProps} />;
            </GukModulesProvider>
        );
    };

    it('renders the list of DAOs', () => {
        render(createTestComponent());
        expect(screen.getByTestId('dao-list-mock')).toBeInTheDocument();
    });

    it('opens the create DAO dialog without firing the seed click event', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));

        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.explore.exploreDaosPage.noCodeSetup.actionLabel',
            }),
        );

        expect(trackEventSpy).not.toHaveBeenCalled();
        expect(open).toHaveBeenCalledWith(CreateDaoDialogId.CREATE_DAO_DETAILS);
    });
});
