import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import * as useSppGuardModule from '@/plugins/sppPlugin/hooks/useSppPermissionCheckProposalCreation';
import {
    type IDaoPermissionCondition,
    type IDaoPlugin,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import * as useDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import { SppRuleConditionSlot } from './sppRuleConditionSlot';

jest.mock('@/plugins/sppPlugin/hooks/useSppPermissionCheckProposalCreation');
jest.mock('@/shared/hooks/useDaoPlugins');

describe('<SppRuleConditionSlot /> component', () => {
    const createTestComponent = (
        props?: Partial<IDaoPermissionCondition> & {
            conditionAddress?: string;
            daoId?: string;
        },
    ) => (
        <GukModulesProvider>
            <SppRuleConditionSlot conditionType="spp-rule" {...props} />
        </GukModulesProvider>
    );

    it('renders every normalized SPP rule field', () => {
        render(
            createTestComponent({
                rules: [
                    {
                        type: 'condition',
                        operation: 'return',
                        value: '1234',
                        permissionId: '0xpermission',
                        ruleIndexes: [1, 2],
                        conditionAddress:
                            '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                    },
                ],
            }),
        );

        expect(
            screen.getByText(/sppRuleConditionSlot.description/),
        ).toBeInTheDocument();
        expect(
            screen.getByText((content) =>
                content.startsWith('app.settings.sppRuleConditionSlot.rule '),
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('Condition')).toBeInTheDocument();
        expect(screen.getByText('Return')).toBeInTheDocument();
        expect(screen.getByText('1234')).toBeInTheDocument();
        expect(screen.getByText('0xpermission')).toBeInTheDocument();
        expect(screen.getByText('1, 2')).toBeInTheDocument();
        expect(screen.getByText('0xC0Ff…4979')).toBeInTheDocument();
    });
    it('does not render an empty condition address', () => {
        render(
            createTestComponent({
                rules: [
                    {
                        type: 'condition',
                        operation: 'return',
                        value: '1234',
                        permissionId: '0xpermission',
                        conditionAddress: '',
                    },
                ],
            }),
        );

        expect(
            screen.queryByText(
                /app\.settings\.sppRuleConditionSlot\.conditionAddress/,
            ),
        ).not.toBeInTheDocument();
    });
    it('does not render empty rule references', () => {
        render(
            createTestComponent({
                rules: [
                    {
                        type: 'condition',
                        operation: 'return',
                        value: '1234',
                        permissionId: '0xpermission',
                        ruleIndexes: [],
                    },
                ],
            }),
        );

        expect(
            screen.queryByText(
                /app\.settings\.sppRuleConditionSlot\.ruleIndexes/,
            ),
        ).not.toBeInTheDocument();
    });

    it('renders an explicit empty state when the backend returns no rules', () => {
        render(createTestComponent({ rules: [] }));

        expect(
            screen.getByText(/sppRuleConditionSlot.noRules/),
        ).toBeInTheDocument();
    });

    it('reuses the friendly proposal-creation eligibility when the SPP process resolves', () => {
        const conditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';
        const sppProcess = {
            address: '0xSppProcess',
            interfaceType: PluginInterfaceType.SPP,
            proposalCreationConditionAddress: conditionAddress,
            settings: { stages: [] },
        } as unknown as IDaoPlugin;

        (useDaoPluginsModule.useDaoPlugins as jest.Mock).mockReturnValue([
            { meta: sppProcess },
        ]);
        (
            useSppGuardModule.useSppPermissionCheckProposalCreation as jest.Mock
        ).mockReturnValue({
            hasPermission: false,
            isLoading: false,
            isRestricted: true,
            settings: [
                [
                    {
                        term: 'Friendly term',
                        definition: 'Friendly definition',
                    },
                ],
            ],
        });

        render(createTestComponent({ conditionAddress, daoId: 'dao-test' }));

        expect(screen.getByText('Friendly term')).toBeInTheDocument();
        expect(screen.getByText('Friendly definition')).toBeInTheDocument();
        expect(
            screen.queryByText(/sppRuleConditionSlot.description/),
        ).not.toBeInTheDocument();
    });

    it('remounts the eligibility subtree when another permission resolves a different SPP process', () => {
        const conditionA = '0xAAAAee254729296a45a3885639AC7E10F9d54979';
        const conditionB = '0xBBBBee254729296a45a3885639AC7E10F9d54979';
        const buildProcess = (
            address: string,
            proposalCreationConditionAddress: string,
            bodyCount: number,
        ) =>
            ({
                address,
                interfaceType: PluginInterfaceType.SPP,
                proposalCreationConditionAddress,
                settings: { stages: Array.from({ length: bodyCount }) },
            }) as unknown as IDaoPlugin;

        (useDaoPluginsModule.useDaoPlugins as jest.Mock).mockReturnValue([
            { meta: buildProcess('0xProcessA', conditionA, 1) },
            { meta: buildProcess('0xProcessB', conditionB, 3) },
        ]);

        // Mirrors the real guard hook, which calls one hook per stage body, so
        // the hook count varies with the resolved process.
        (
            useSppGuardModule.useSppPermissionCheckProposalCreation as jest.Mock
        ).mockImplementation(
            ({
                plugin,
            }: {
                plugin: { address: string; settings: { stages: unknown[] } };
            }) => {
                for (const _body of plugin.settings.stages) {
                    // biome-ignore lint/correctness/useHookAtTopLevel: mirrors the guard hook, whose hook count varies per stage body
                    useState(undefined);
                }

                return {
                    hasPermission: false,
                    isLoading: false,
                    isRestricted: true,
                    settings: [
                        [{ term: 'Process', definition: plugin.address }],
                    ],
                };
            },
        );

        const { rerender } = render(
            createTestComponent({
                conditionAddress: conditionA,
                daoId: 'dao-test',
            }),
        );
        expect(screen.getByText('0xProcessA')).toBeInTheDocument();

        rerender(
            createTestComponent({
                conditionAddress: conditionB,
                daoId: 'dao-test',
            }),
        );

        expect(screen.getByText('0xProcessB')).toBeInTheDocument();
    });
});
