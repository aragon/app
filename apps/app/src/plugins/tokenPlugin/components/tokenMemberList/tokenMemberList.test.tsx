import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as wagmi from 'wagmi';
import { generateDaoPlugin } from '@/shared/testUtils';
import * as useTokenDelegationOnboardingCheckModule from '../../hooks/useTokenDelegationOnboardingCheck';
import * as useTokenLockAndWrapOnboardingCheckModule from '../../hooks/useTokenLockAndWrapOnboardingCheck';
import { generateTokenPluginSettings } from '../../testUtils';
import { type ITokenMemberListProps, TokenMemberList } from './tokenMemberList';

const tokenMemberListBaseMock = jest.fn<
    ReactNode,
    [
        {
            enableDelegation?: boolean;
            onboardingCard?: ReactNode;
            children?: ReactNode;
        },
    ]
>();

jest.mock('./tokenMemberListBase', () => ({
    TokenMemberListBase: (props: {
        enableDelegation?: boolean;
        onboardingCard?: ReactNode;
        children?: ReactNode;
    }) => {
        tokenMemberListBaseMock(props);
        return (
            <div data-testid="member-list-base-mock">
                <div data-testid="enable-delegation-flag">
                    {String(props.enableDelegation)}
                </div>
                {props.onboardingCard}
                {props.children}
            </div>
        );
    },
}));

jest.mock('./components/tokenMemberListDelegationCardEmptyState', () => ({
    TokenMemberListDelegationCardEmptyState: () => (
        <div data-testid="delegation-card-mock" />
    ),
}));

jest.mock('./components/tokenMemberListLockCardEmptyState', () => ({
    TokenMemberListLockCardEmptyState: () => (
        <div data-testid="lock-card-mock" />
    ),
}));

jest.mock('./components/tokenMemberListWrapCardEmptyState', () => ({
    TokenMemberListWrapCardEmptyState: () => (
        <div data-testid="wrap-card-mock" />
    ),
}));

describe('<TokenMemberList /> component', () => {
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useDelegationOnboardingCheckSpy = jest.spyOn(
        useTokenDelegationOnboardingCheckModule,
        'useTokenDelegationOnboardingCheck',
    );
    const useLockAndWrapOnboardingCheckSpy = jest.spyOn(
        useTokenLockAndWrapOnboardingCheckModule,
        'useTokenLockAndWrapOnboardingCheck',
    );

    beforeEach(() => {
        tokenMemberListBaseMock.mockReset();
        useConnectionSpy.mockReturnValue({
            address: undefined,
        } as unknown as wagmi.UseConnectionReturnType);
        useDelegationOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: false,
            isLoading: false,
        });
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: false,
            isLoading: false,
        });
    });

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDelegationOnboardingCheckSpy.mockReset();
        useLockAndWrapOnboardingCheckSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberListProps>) => {
        const completeProps: ITokenMemberListProps = {
            initialParams: {
                queryParams: { daoId: 'dao-id', pluginAddress: '0x123' },
            },
            plugin: generateDaoPlugin({
                settings: generateTokenPluginSettings(),
            }),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenMemberList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('passes delegation support through to the shared member list base', () => {
        const plugin = generateDaoPlugin({
            settings: generateTokenPluginSettings({
                token: generateTokenPluginSettings().token,
            }),
        });

        render(createTestComponent({ plugin }));

        expect(screen.getByTestId('member-list-base-mock')).toBeInTheDocument();
        expect(screen.getByTestId('enable-delegation-flag')).toHaveTextContent(
            String(plugin.settings.token.hasDelegate),
        );
    });

    it('renders the delegation card when showDelegationCard is true', () => {
        useDelegationOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        render(createTestComponent());
        expect(screen.getByTestId('delegation-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
    });

    it('renders the lock card when showLockOrWrapCard is true and plugin has votingEscrow', () => {
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        const plugin = generateDaoPlugin({
            settings: generateTokenPluginSettings({
                votingEscrow: {
                    minDeposit: '0',
                    minLockTime: 0,
                    cooldown: 0,
                    maxTime: 0,
                    slope: 0,
                    bias: 0,
                },
            }),
        });
        render(createTestComponent({ plugin }));
        expect(screen.getByTestId('lock-card-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('delegation-card-mock'),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
    });

    it('renders the wrap card when showLockOrWrapCard is true and plugin has no votingEscrow', () => {
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        const plugin = generateDaoPlugin({
            settings: generateTokenPluginSettings({ votingEscrow: undefined }),
        });
        render(createTestComponent({ plugin }));
        expect(screen.getByTestId('wrap-card-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('delegation-card-mock'),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
    });

    it('renders the delegation card over lock/wrap card when both conditions are true', () => {
        useDelegationOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        render(createTestComponent());
        expect(screen.getByTestId('delegation-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
    });

    it('renders no onboarding card when neither condition is true', () => {
        render(createTestComponent());
        expect(screen.getByTestId('member-list-base-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('delegation-card-mock'),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
    });
});
