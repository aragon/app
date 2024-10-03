import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';

export const generateTabComponentPlugin = <TMeta extends object, TProps extends object>(
    plugin?: Partial<ITabComponentPlugin<TMeta, TProps>>,
): ITabComponentPlugin<TMeta, TProps> => ({
    id: 'id',
    uniqueId: 'id-1',
    meta: {} as TMeta,
    props: {} as TProps,
    ...plugin,
});
