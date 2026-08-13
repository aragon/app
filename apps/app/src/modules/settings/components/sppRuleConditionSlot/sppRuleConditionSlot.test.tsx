import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IDaoPermissionCondition } from '@/shared/api/daoService';
import { SppRuleConditionSlot } from './sppRuleConditionSlot';

describe('<SppRuleConditionSlot /> component', () => {
    const createTestComponent = (props?: Partial<IDaoPermissionCondition>) => (
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

    it('renders an explicit empty state when the backend returns no rules', () => {
        render(createTestComponent({ rules: [] }));

        expect(
            screen.getByText(/sppRuleConditionSlot.noRules/),
        ).toBeInTheDocument();
    });
});
