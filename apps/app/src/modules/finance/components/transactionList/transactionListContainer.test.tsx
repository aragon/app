import { render } from '@testing-library/react';
import type { IDaoFilterOption } from '@/shared/hooks/useDaoFilterUrlParam';
import {
    type ITransactionListContainerProps,
    TransactionListContainer,
} from './transactionListContainer';
import type { ITransactionListDefaultProps } from './transactionListDefault';
import * as transactionListDefaultModule from './transactionListDefault';

describe('<TransactionListContainer /> component', () => {
    const transactionListDefaultSpy = jest.spyOn(
        transactionListDefaultModule,
        'TransactionListDefault',
    );

    const onSelect = jest.fn();

    const allOption: IDaoFilterOption = {
        id: 'all',
        label: 'All',
        daoId: 'parent-dao',
        isAll: true,
        isParent: false,
    };

    const subDaoOption: IDaoFilterOption = {
        id: 'sub-1',
        label: 'Rewards SubDAO',
        daoId: 'sub-1',
        isAll: false,
        isParent: false,
        onlyParent: false,
    };

    const defaultOptions: IDaoFilterOption[] = [allOption, subDaoOption];

    let capturedProps: ITransactionListDefaultProps | undefined;

    beforeEach(() => {
        capturedProps = undefined;
        transactionListDefaultSpy.mockImplementation((props) => {
            capturedProps = props;
            return null;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (
        props?: Partial<ITransactionListContainerProps>,
    ) => {
        const completeProps: ITransactionListContainerProps = {
            initialParams: { queryParams: { daoId: 'parent-dao' } },
            bodyFilter: {
                options: defaultOptions,
                value: subDaoOption,
                onSelect,
            },
            ...props,
        };

        return <TransactionListContainer {...completeProps} />;
    };

    it('merges the active bodyFilter value daoId and onlyParent into initialParams.queryParams, and forces address to undefined', () => {
        render(createTestComponent());

        expect(capturedProps?.initialParams.queryParams).toEqual(
            expect.objectContaining({
                daoId: 'sub-1',
                address: undefined,
                onlyParent: false,
            }),
        );
    });

    it('forwards the bodyFilter to the list component', () => {
        render(createTestComponent());

        expect(capturedProps?.bodyFilter).toEqual({
            options: defaultOptions,
            value: subDaoOption,
            onSelect,
        });
    });

    it('forwards an absent bodyFilter as undefined', () => {
        render(createTestComponent({ bodyFilter: undefined }));

        expect(capturedProps?.bodyFilter).toBeUndefined();
    });
});
