import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as daoService from '@/shared/api/daoService';
import { DialogProvider } from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import type { IActionComposerProps } from './actionComposer';
import { ActionComposer } from './actionComposer';

describe('ActionComposer', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IActionComposerProps>) => {
        const completeProps: IActionComposerProps = {
            daoId: 'dao-1',
            onAddAction: jest.fn(),
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
        expect(
            screen.getByRole('button', { name: /walletConnect/i }),
        ).toBeInTheDocument();
    });

    it('does not render WalletConnect button when hideWalletConnect is true', () => {
        render(createTestComponent({ hideWalletConnect: true }));
        expect(
            screen.queryByRole('button', { name: /walletConnect/i }),
        ).not.toBeInTheDocument();
    });

    it('allows spaces while typing in the action search input', async () => {
        const user = userEvent.setup();
        render(createTestComponent());

        await user.click(
            screen.getByRole('button', {
                name: 'app.governance.actionComposer.addAction.default',
            }),
        );

        const input = screen.getByRole('combobox');
        await user.type(input, 'Set metadata');

        expect(input).toHaveValue('Set metadata');
    });
});
