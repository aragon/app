import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import {
    TransactionSide,
    type TransactionTransferSide,
} from '../api/financeService';
import { generateTransaction } from '../testUtils';
import { transactionExecutionUtils } from './transactionExecutionUtils';

describe('transactionExecutionUtils', () => {
    describe('getSourcePlugin', () => {
        const plugin = generateDaoPlugin({
            processKey: 'process-key',
            slug: 'plugin-slug',
            subdomain: 'plugin-subdomain',
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
        });
        const dao = generateDao({ plugins: [plugin] });

        it.each([
            { source: 'process-key', identifier: 'process key' },
            { source: 'plugin-slug', identifier: 'slug' },
            { source: 'plugin-subdomain', identifier: 'subdomain' },
            {
                source: PluginInterfaceType.TOKEN_VOTING,
                identifier: 'interface type',
            },
        ])('resolves the plugin by its $identifier', ({ source }) => {
            expect(
                transactionExecutionUtils.getSourcePlugin(source, dao),
            ).toEqual(plugin);
        });

        it('returns undefined when the source matches no plugin', () => {
            expect(
                transactionExecutionUtils.getSourcePlugin('unknown', dao),
            ).toBeUndefined();
        });

        it('returns undefined when the source is not set', () => {
            expect(
                transactionExecutionUtils.getSourcePlugin(undefined, dao),
            ).toBeUndefined();
        });

        it('returns undefined when the dao is not set', () => {
            expect(
                transactionExecutionUtils.getSourcePlugin(
                    'process-key',
                    undefined,
                ),
            ).toBeUndefined();
        });
    });

    describe('isExecution', () => {
        it('returns true for an execution', () => {
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
            });

            expect(transactionExecutionUtils.isExecution(transaction)).toBe(
                true,
            );
        });

        it.each<TransactionTransferSide>([
            TransactionSide.DEPOSIT,
            TransactionSide.WITHDRAW,
        ])('returns false for a %s transfer', (side) => {
            const transaction = generateTransaction({ side });

            expect(transactionExecutionUtils.isExecution(transaction)).toBe(
                false,
            );
        });
    });

    describe('getExecutionLabel', () => {
        const fromAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

        it('returns the name of the plugin that emitted the execution', () => {
            const plugin = generateDaoPlugin({
                interfaceType: PluginInterfaceType.MULTISIG,
                subdomain: 'multisig',
                name: 'Core council',
            });
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
                source: 'multisig',
            });

            expect(
                transactionExecutionUtils.getExecutionLabel(
                    transaction,
                    generateDao({ plugins: [plugin] }),
                ),
            ).toBe('Core council');
        });

        it('returns the raw source when it matches no plugin', () => {
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
                source: 'router',
            });

            expect(
                transactionExecutionUtils.getExecutionLabel(
                    transaction,
                    generateDao(),
                ),
            ).toBe('router');
        });

        it('returns the untruncated sender address when the execution has no source', () => {
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
                source: undefined,
                fromAddress,
            });

            expect(
                transactionExecutionUtils.getExecutionLabel(
                    transaction,
                    undefined,
                ),
            ).toBe(fromAddress);
        });
    });
});
