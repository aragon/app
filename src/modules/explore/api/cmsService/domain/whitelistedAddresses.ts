import type { PluginInterfaceType } from '@/shared/api/daoService';

export type IWhitelistedAddresses = Partial<Record<PluginInterfaceType, string[]>>;
