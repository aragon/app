import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { SelectPluginDialog } from './selectPluginDialog';

jest.mock('@aragon/gov-ui-kit', () => {
    const actual = jest.requireActual('@aragon/gov-ui-kit');

    return {
        ...actual,
        Dialog: {
            Content: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
            Footer: ({
                primaryAction,
                secondaryAction,
            }: {
                primaryAction: { label: string; onClick?: () => void };
                secondaryAction: { label: string; onClick?: () => void };
            }) => (
                <div>
                    <button onClick={primaryAction.onClick} type="button">
                        {primaryAction.label}
                    </button>
                    <button onClick={secondaryAction.onClick} type="button">
                        {secondaryAction.label}
                    </button>
                </div>
            ),
            Header: ({ title }: { title: string }) => <div>{title}</div>,
        },
    };
});

jest.mock('./selectPluginDialogProcessListItem', () => {
    const { useEffect } = jest.requireActual('react');

    return {
        SelectPluginDialogProcessListItem: ({
            uniqueId,
            process,
            onEligibilityResult,
        }: {
            uniqueId: string;
            process: { interfaceType: string };
            onEligibilityResult: (
                uniqueId: string,
                isEligible: boolean,
            ) => void;
        }) => {
            useEffect(() => {
                onEligibilityResult(uniqueId, true);
            }, [onEligibilityResult, uniqueId]);

            return (
                <div data-testid={`plugin-${uniqueId}`}>
                    {process.interfaceType}
                </div>
            );
        },
    };
});

describe('<SelectPluginDialog /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
        useDaoSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createPlugin = (
        id: string,
        interfaceType: daoService.PluginInterfaceType,
    ) =>
        generateFilterComponentPlugin({
            id,
            uniqueId: id,
            meta: generateDaoPlugin({ interfaceType }),
        });

    const createTestComponent = (allowNativeSafe?: boolean) => (
        <GukModulesProvider>
            <SelectPluginDialog
                location={{
                    id: 'test',
                    params: {
                        allowNativeSafe,
                        daoId: 'dao-id',
                    },
                }}
            />
        </GukModulesProvider>
    );

    it('keeps native Safe out of non-creation chooser flows', async () => {
        const nativeSafe = createPlugin(
            'safe',
            daoService.PluginInterfaceType.SAFE,
        );
        const spp = createPlugin('spp', daoService.PluginInterfaceType.SPP);
        useDaoPluginsSpy.mockReturnValue([nativeSafe, spp]);

        render(createTestComponent());

        await waitFor(() =>
            expect(screen.getByTestId('plugin-spp')).toBeInTheDocument(),
        );
        expect(screen.queryByTestId('plugin-safe')).not.toBeInTheDocument();
    });

    it('includes native Safe with SPP when proposal creation opts in', async () => {
        const nativeSafe = createPlugin(
            'safe',
            daoService.PluginInterfaceType.SAFE,
        );
        const spp = createPlugin('spp', daoService.PluginInterfaceType.SPP);
        useDaoPluginsSpy.mockReturnValue([nativeSafe, spp]);

        render(createTestComponent(true));

        await waitFor(() => {
            expect(screen.getByTestId('plugin-safe')).toBeInTheDocument();
            expect(screen.getByTestId('plugin-spp')).toBeInTheDocument();
        });
    });
});
