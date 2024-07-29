import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { governanceService } from '../../api/governanceService';
import { type ITokenMemberInfoProps, TokenMemberInfo } from './tokenMemberInfo';

describe('<TokenMemberInfo /> component', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');
    const useMemberListSpy = jest.spyOn(governanceService, 'getMemberList');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
        useMemberListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberInfoProps>) => {
        const client = new QueryClient();
        const completeProps: ITokenMemberInfoProps = {
            daoId: 'test-id',
            ...props,
        };

        return (
            <QueryClientProvider client={client}>
                <OdsModulesProvider>
                    <TokenMemberInfo {...completeProps} />
                </OdsModulesProvider>
            </QueryClientProvider>
        );
    };

    it('renders the component with the correct eligible voters and members info', () => {
        render(createTestComponent());
        expect(screen.getByText('app.plugins.token.tokenMemberInfo.eligibleVoters')).toBeInTheDocument();
    });
});
