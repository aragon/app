import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
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
});
