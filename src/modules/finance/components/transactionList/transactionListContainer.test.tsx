import { render } from '@testing-library/react';
import type { IDaoFilterOption } from '@/shared/hooks/useDaoFilterUrlParam';
import * as useDaoFilterUrlParamModule from '@/shared/hooks/useDaoFilterUrlParam';
import {
    type ITransactionListContainerProps,
    TransactionListContainer,
} from './transactionListContainer';
import type { ITransactionListDefaultProps } from './transactionListDefault';
import * as transactionListDefaultModule from './transactionListDefault';

describe('<TransactionListContainer /> component', () => {
    const useDaoFilterUrlParamSpy = jest.spyOn(
        useDaoFilterUrlParamModule,
        'useDaoFilterUrlParam',
    );

    const transactionListDefaultSpy = jest.spyOn(
        transactionListDefaultModule,
        'TransactionListDefault',
    );

    const setActiveOption = jest.fn();

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
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: subDaoOption,
            setActiveOption,
            options: defaultOptions,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (
        props?: Partial<ITransactionListContainerProps>,
    ) => {
        const completeProps: ITransactionListContainerProps = {
            daoId: 'parent-dao',
            initialParams: { queryParams: { daoId: 'parent-dao' } },
            ...props,
        };

        return <TransactionListContainer {...completeProps} />;
    };

    it('merges activeOption daoId and onlyParent into initialParams.queryParams, and forces address to undefined', () => {
        render(createTestComponent());

        expect(capturedProps?.initialParams.queryParams).toEqual(
            expect.objectContaining({
                daoId: 'sub-1',
                address: undefined,
                onlyParent: false,
            }),
        );
    });

    it('constructs bodyFilter from hook options, activeOption, and setActiveOption when both are present', () => {
        render(createTestComponent());

        expect(capturedProps?.bodyFilter).toEqual({
            options: defaultOptions,
            value: subDaoOption,
            onSelect: setActiveOption,
        });
    });

    it('passes bodyFilter as undefined when activeOption and options are absent', () => {
        useDaoFilterUrlParamSpy.mockReturnValue({
            activeOption: undefined,
            setActiveOption: jest.fn(),
            options: undefined,
        });

        render(createTestComponent());

        expect(capturedProps?.bodyFilter).toBeUndefined();
    });
});
