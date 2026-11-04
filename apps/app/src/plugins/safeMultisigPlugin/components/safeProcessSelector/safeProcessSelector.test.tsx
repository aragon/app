import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import * as safePermissionHook from '../../hooks/useSafeProcessPermissionCheckProposalCreation';
import { SafeProcessSelector } from './safeProcessSelector';

describe('<SafeProcessSelector /> component', () => {
    const useSafePermissionSpy = jest.spyOn(
        safePermissionHook,
        'useSafeProcessPermissionCheckProposalCreation',
    );

    beforeEach(() => {
        useSafePermissionSpy.mockReturnValue({
            hasPermission: true,
            isLoading: false,
            isRestricted: true,
            settings: [],
        });
    });

    afterEach(() => {
        useSafePermissionSpy.mockReset();
    });

    it('enables an eligible Safe process and reports its unique id', async () => {
        const onEligibilityResult = jest.fn();
        const onClick = jest.fn();

        render(
            <GukModulesProvider>
                <SafeProcessSelector
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    process={generateDaoPlugin({
                        interfaceType: PluginInterfaceType.SAFE,
                        name: 'Native Safe',
                    })}
                    uniqueId="safe-instance"
                />
            </GukModulesProvider>,
        );

        await waitFor(() =>
            expect(onEligibilityResult).toHaveBeenCalledWith(
                'safe-instance',
                true,
            ),
        );
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('denies the process again when permission is revoked on rerender', async () => {
        const onEligibilityResult = jest.fn();
        const onClick = jest.fn();
        let hasPermission = true;
        const process = generateDaoPlugin({
            interfaceType: PluginInterfaceType.SAFE,
        });
        const selector = (
            <GukModulesProvider>
                <SafeProcessSelector
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    process={process}
                    uniqueId="safe-instance"
                />
            </GukModulesProvider>
        );

        useSafePermissionSpy.mockImplementation(() => ({
            hasPermission,
            isLoading: false,
            isRestricted: true,
            settings: [],
        }));

        const view = render(selector);
        await waitFor(() =>
            expect(onEligibilityResult).toHaveBeenCalledWith(
                'safe-instance',
                true,
            ),
        );

        hasPermission = false;
        view.rerender(
            <GukModulesProvider>
                <SafeProcessSelector
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    process={process}
                    uniqueId="safe-instance"
                />
            </GukModulesProvider>,
        );

        await waitFor(() =>
            expect(onEligibilityResult).toHaveBeenCalledWith(
                'safe-instance',
                false,
            ),
        );
        expect(onClick).not.toHaveBeenCalled();
    });

    it('does not allow a Safe process without creation permission', async () => {
        useSafePermissionSpy.mockReturnValue({
            hasPermission: false,
            isLoading: false,
            isRestricted: true,
            settings: [],
        });
        const onEligibilityResult = jest.fn();
        const onClick = jest.fn();

        render(
            <GukModulesProvider>
                <SafeProcessSelector
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    process={generateDaoPlugin({
                        interfaceType: PluginInterfaceType.SAFE,
                    })}
                    uniqueId="safe-instance"
                />
            </GukModulesProvider>,
        );

        await waitFor(() =>
            expect(onEligibilityResult).toHaveBeenCalledWith(
                'safe-instance',
                false,
            ),
        );
        await userEvent.click(screen.getByText('Safe 0x123'));
        expect(onClick).not.toHaveBeenCalled();
    });
});
