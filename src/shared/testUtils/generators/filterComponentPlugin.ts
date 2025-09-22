import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';

export const generateFilterComponentPlugin = <TMeta extends object, TProps extends object>(
    plugin?: Partial<IFilterComponentPlugin<TMeta, TProps>>,
): IFilterComponentPlugin<TMeta, TProps> => ({
    id: 'id',
    uniqueId: 'id-1',
    meta: {} as TMeta,
    label: 'Label',
    props: {} as TProps,
    ...plugin,
});
