import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SafeDialogId } from '@/modules/safe/constants';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDialogContext,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceTodoSafeTransactionItemProps,
    WorkspaceTodoSafeTransactionItem,
} from './workspaceTodoSafeTransactionItem';

describe('<WorkspaceTodoSafeTransactionItem /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const account: IWorkspaceAccount = {
        id: 'ethereum-sepolia-0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        type: WorkspaceAccountType.SAFE,
        network: Network.ETHEREUM_SEPOLIA,
        address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        metadata: { name: 'Treasury' },
    };

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceTodoSafeTransactionItemProps>,
    ) => {
        const completeProps: IWorkspaceTodoSafeTransactionItemProps = {
            account,
            safeInfo: generateSafeInfo({ threshold: 2, version: '1.4.1' }),
            transaction: generateSafeTransaction({
                nonce: '12',
                confirmations: [
                    { owner: '0xOwner', signature: '0x', submissionDate: '' },
                ] as never,
                confirmationsRequired: 3,
            }),
            hasNonceRival: false,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoSafeTransactionItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('titles the row with the nonce and counts the signatures against the Safe threshold', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                /workspaceTodoList\.transaction\.title \(nonce=12\)/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /workspaceTodoList\.transaction\.meta \(account=Treasury,count=1,required=2\)/,
            ),
        ).toBeInTheDocument();
    });

    it('falls back to the queue threshold when the Safe could not be read', () => {
        render(createTestComponent({ safeInfo: null }));

        expect(screen.getByText(/count=1,required=3\)/)).toBeInTheDocument();
    });

    it('flags a nonce conflict', () => {
        render(createTestComponent({ hasNonceRival: true }));

        expect(
            screen.getByText(/workspaceTodoList\.transaction\.nonceRival$/),
        ).toBeInTheDocument();
    });

    it('opens the review dialog of the transaction on sign', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        const transaction = generateSafeTransaction({ nonce: '12' });
        render(createTestComponent({ transaction }));

        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceTodoList\.transaction\.action$/,
            }),
        );
        expect(open).toHaveBeenCalledWith(SafeDialogId.TRANSACTION_REVIEW, {
            params: {
                transaction,
                safeAddress: account.address,
                network: account.network,
                safeVersion: '1.4.1',
            },
        });
    });
});
