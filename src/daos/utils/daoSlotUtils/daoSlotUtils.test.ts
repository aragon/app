import { daoSlotUtils } from './daoSlotUtils';

describe('daoSlotUtils', () => {
    describe('generateDomain', () => {
        it('generates domains with plugin, slots, and metadata', () => {
            const result = daoSlotUtils.generateDomain({
                configs: [
                    {
                        plugin: { id: 'plugin-a', name: 'Plugin A' },
                        address: '0xabc',
                    },
                    {
                        plugin: { id: 'plugin-b', name: 'Plugin B' },
                    },
                ],
                getPlugin: (config) => config.plugin,
                getMeta: (config) => ({ address: config.address }),
                getSlotComponents: (config) => [
                    {
                        slotId: 'header',
                        component: (() => null) as never,
                    },
                    {
                        slotId: `details-${config.plugin.id}`,
                        component: (() => null) as never,
                    },
                ],
                getSlotFunctions: (config) =>
                    config.address == null
                        ? []
                        : [
                              {
                                  slotId: 'resolver',
                                  fn: () => config.address,
                              },
                          ],
            });

            expect(result).toEqual([
                {
                    plugin: { id: 'plugin-a', name: 'Plugin A' },
                    slotComponents: [
                        {
                            slotId: 'header',
                            component: expect.any(Function),
                        },
                        {
                            slotId: 'details-plugin-a',
                            component: expect.any(Function),
                        },
                    ],
                    slotFunctions: [
                        {
                            slotId: 'resolver',
                            fn: expect.any(Function),
                        },
                    ],
                    meta: { address: '0xabc' },
                },
                {
                    plugin: { id: 'plugin-b', name: 'Plugin B' },
                    slotComponents: [
                        {
                            slotId: 'header',
                            component: expect.any(Function),
                        },
                        {
                            slotId: 'details-plugin-b',
                            component: expect.any(Function),
                        },
                    ],
                    slotFunctions: [],
                    meta: { address: undefined },
                },
            ]);

            expect(result[0].slotFunctions?.[0]?.fn({})).toBe('0xabc');
        });

        it('omits optional fields when callbacks are not provided', () => {
            const result = daoSlotUtils.generateDomain({
                configs: [{ plugin: { id: 'plugin-a', name: 'Plugin A' } }],
                getPlugin: (config) => config.plugin,
            });

            expect(result).toEqual([
                {
                    plugin: { id: 'plugin-a', name: 'Plugin A' },
                    slotComponents: undefined,
                    slotFunctions: undefined,
                    meta: undefined,
                },
            ]);
        });
    });
});
