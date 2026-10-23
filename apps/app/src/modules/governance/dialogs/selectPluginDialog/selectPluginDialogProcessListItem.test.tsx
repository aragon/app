import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as simulateProposalModule from '@/modules/governance/hooks/useSimulateProposal';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { SelectPluginDialogProcessListItem } from './selectPluginDialogProcessListItem';

describe('<SelectPluginDialogProcessListItem /> component', () => {
    const useSimulateProposalSpy = jest.spyOn(
        simulateProposalModule,
        'useSimulateProposalCreation',
    );

    beforeEach(() => {
        useSimulateProposalSpy.mockReturnValue({
            isError: false,
            isLoading: false,
            result: undefined,
        });
    });

    afterEach(() => {
        useSimulateProposalSpy.mockReset();
    });

    it('keeps the row disabled while proposal creation is loading', async () => {
        useSimulateProposalSpy.mockReturnValue({
            isError: false,
            isLoading: true,
            result: undefined,
        });
        const onEligibilityResult = jest.fn();
        const onClick = jest.fn();

        render(
            <GukModulesProvider>
                <SelectPluginDialogProcessListItem
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    process={generateDaoPlugin({
                        interfaceType: PluginInterfaceType.UNKNOWN,
                        name: 'Process',
                    })}
                    uniqueId="process"
                />
            </GukModulesProvider>,
        );

        await userEvent.click(screen.getByText('Process'));
        expect(onClick).not.toHaveBeenCalled();
        expect(onEligibilityResult).not.toHaveBeenCalled();
    });

    it('reports a reverted proposal creation as ineligible', async () => {
        useSimulateProposalSpy.mockReturnValue({
            isError: false,
            isLoading: false,
            result: 'failure',
        });
        const onEligibilityResult = jest.fn();
        const onClick = jest.fn();

        render(
            <GukModulesProvider>
                <SelectPluginDialogProcessListItem
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    process={generateDaoPlugin({
                        interfaceType: PluginInterfaceType.UNKNOWN,
                        name: 'Process',
                    })}
                    uniqueId="process"
                />
            </GukModulesProvider>,
        );

        await waitFor(() =>
            expect(onEligibilityResult).toHaveBeenCalledWith('process', false),
        );
        await userEvent.click(screen.getByText('Process'));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('fails open when the simulation request errors', async () => {
        useSimulateProposalSpy.mockReturnValue({
            isError: true,
            isLoading: false,
            result: undefined,
        });
        const onEligibilityResult = jest.fn();
        const onClick = jest.fn();

        render(
            <GukModulesProvider>
                <SelectPluginDialogProcessListItem
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    process={generateDaoPlugin({
                        interfaceType: PluginInterfaceType.UNKNOWN,
                        name: 'Process',
                    })}
                    uniqueId="process"
                />
            </GukModulesProvider>,
        );

        await waitFor(() =>
            expect(onEligibilityResult).toHaveBeenCalledWith('process', true),
        );
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('keeps eligibility results isolated by process unique id', async () => {
        const onEligibilityResult = jest.fn();
        const dao = generateDao();

        render(
            <GukModulesProvider>
                <SelectPluginDialogProcessListItem
                    dao={dao}
                    isActive={false}
                    onClick={jest.fn()}
                    onEligibilityResult={onEligibilityResult}
                    process={generateDaoPlugin({
                        address: '0xprocess-one',
                        daoAddress: '0xdao-one',
                        interfaceType: PluginInterfaceType.UNKNOWN,
                    })}
                    uniqueId="dao-one-process"
                />
                <SelectPluginDialogProcessListItem
                    dao={dao}
                    isActive={false}
                    onClick={jest.fn()}
                    onEligibilityResult={onEligibilityResult}
                    process={generateDaoPlugin({
                        address: '0xprocess-two',
                        daoAddress: '0xdao-two',
                        interfaceType: PluginInterfaceType.UNKNOWN,
                    })}
                    uniqueId="dao-two-process"
                />
            </GukModulesProvider>,
        );

        await waitFor(() => {
            expect(onEligibilityResult).toHaveBeenCalledWith(
                'dao-one-process',
                true,
            );
            expect(onEligibilityResult).toHaveBeenCalledWith(
                'dao-two-process',
                true,
            );
        });
    });
});
