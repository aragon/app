import * as useVoteListData from '@/modules/governance/hooks/useVoteListData';
import { render } from '@testing-library/react';
import { type ITokenVoteListProps, TokenVoteList } from './tokenVoteList';

describe('<TokenVoteList /> component', () => {
    const useVoteListDataSpy = jest.spyOn(useVoteListData, 'useVoteListData');

    afterEach(() => {
        useVoteListDataSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenVoteListProps>) => {
        const completeProps: ITokenVoteListProps = {
            initialParams: { queryParams: {} },
            ...props,
        };

        return <TokenVoteList {...completeProps} />;
    };

    it('fetches and renders the list of token votes', () => {
        render(createTestComponent());
    });
});
