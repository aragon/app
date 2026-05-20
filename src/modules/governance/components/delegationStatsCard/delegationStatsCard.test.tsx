import { render, screen } from '@testing-library/react';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import { generateDaoPlugin } from '@/shared/testUtils';
import type { IDelegationStatsCardProps } from './delegationStatsCard';
import { DelegationStatsCard } from './delegationStatsCard';

jest.mock('../memberDelegateButton', () => ({
    MemberDelegateButton: () => <button type="button">delegate</button>,
}));

describe('<DelegationStatsCard /> component', () => {
    const useSlotSingleFunctionSpy = jest.spyOn(
        useSlotSingleFunction,
        'useSlotSingleFunction',
    );

    beforeEach(() => {
        useSlotSingleFunctionSpy.mockReturnValue([
            { label: 'Voting power', value: '100' },
        ]);
    });

    afterEach(() => {
        useSlotSingleFunctionSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDelegationStatsCardProps>,
    ) => {
        const completeProps: IDelegationStatsCardProps = {
            daoId: 'test-dao',
            memberAddress: '0x123',
            plugin: generateDaoPlugin({
                interfaceType: PluginInterfaceType.TOKEN_VOTING,
                settings: generateTokenPluginSettings(),
            }),
            ...props,
        };

        return <DelegationStatsCard {...completeProps} />;
    };

    it('hides the delegation scope disclaimer by default', () => {
        render(createTestComponent());
        expect(
            screen.queryByText('app.governance.delegationStatsCard.disclaimer'),
        ).not.toBeInTheDocument();
    });

    it('renders the delegation scope disclaimer when enabled', () => {
        render(createTestComponent({ displayDisclaimer: true }));
        expect(
            screen.getByText('app.governance.delegationStatsCard.disclaimer'),
        ).toBeInTheDocument();
    });
});
