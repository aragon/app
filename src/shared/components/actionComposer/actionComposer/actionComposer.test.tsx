import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DialogProvider } from '../../dialogProvider';
import type { IActionComposerProps } from './actionComposer';
import { ActionComposer } from './actionComposer';

describe('ActionComposer', () => {
    const createTestComponent = (props?: Partial<IActionComposerProps>) => {
        const completeProps: IActionComposerProps = {
            daoId: 'dao-1',
            onAddAction: jest.fn(),
            nativeGroups: [],
            nativeItems: [],
            ...props,
        };

        return (
            <GukModulesProvider>
                <DialogProvider>
                    <ActionComposer {...completeProps} />
                </DialogProvider>
            </GukModulesProvider>
        );
    };

    it('renders WalletConnect button by default', () => {
        render(createTestComponent());
        expect(screen.getByRole('button', { name: /walletconnect/i })).toBeInTheDocument();
    });

    it('does not render WalletConnect button when hideWalletConnect is true', () => {
        render(createTestComponent({ hideWalletConnect: true }));
        expect(screen.queryByRole('button', { name: /walletconnect/i })).not.toBeInTheDocument();
    });
});
