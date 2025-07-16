import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoService from '../../../api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '../../../testUtils';
import { DialogProvider } from '../../dialogProvider';
import type { IActionComposerProps } from './actionComposer';
import { ActionComposer } from './actionComposer';

describe('ActionComposer', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });

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
        expect(screen.getByRole('button', { name: /walletConnect/i })).toBeInTheDocument();
    });

    it('does not render WalletConnect button when hideWalletConnect is true', () => {
        render(createTestComponent({ hideWalletConnect: true }));
        expect(screen.queryByRole('button', { name: /walletConnect/i })).not.toBeInTheDocument();
    });
});
