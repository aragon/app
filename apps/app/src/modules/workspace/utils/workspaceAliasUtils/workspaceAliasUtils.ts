import { addressUtils, validateName } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import { networkUtils } from '@/shared/utils/networkUtils';
import type { IWorkspaceAlias } from '../../api/workspaceService/domain';

export interface IWorkspaceAliasInput {
    address: string;
    name: string;
    network: Network | null;
}

const aliasKeys = ['address', 'name', 'network', 'updatedAt'];

class WorkspaceAliasUtils {
    /**
     * Most aliases a workspace holds.
     */
    readonly maxAliasesPerWorkspace = 500;

    /**
     * Longest name read from a file. Names are checked against the stricter rules of `validateName` when the address
     * book is built, this only bounds what is stored.
     */
    readonly maxStoredNameLength = 200;

    /**
     * Reads the aliases of an imported workspace. Records are rebuilt from the known fields, anything else rejects the
     * file. Names are not judged here: every stored name is checked again each time the address book is built.
     *
     * @param value - The `aliases` of a file.
     * @param importedAt - Time of the import, the latest `updatedAt` an alias can claim.
     * @throws {Error} when the value is not a valid list of aliases.
     */
    parse = (value: unknown, importedAt: number): IWorkspaceAlias[] => {
        if (!Array.isArray(value)) {
            throw new Error('The aliases of a workspace must be a list.');
        }

        if (value.length > this.maxAliasesPerWorkspace) {
            throw new Error(
                `A workspace holds at most ${this.maxAliasesPerWorkspace} aliases.`,
            );
        }

        const aliases = value.map((record) =>
            this.parseAlias(record, importedAt),
        );
        const keys = new Set(aliases.map((alias) => this.buildKey(alias)));

        if (keys.size !== aliases.length) {
            throw new Error(
                'A workspace names the same address and network twice.',
            );
        }

        return aliases;
    };

    /**
     * Adds an alias, or edits the one of the same address and network. The address is stored in checksum format.
     *
     * @throws {Error} when the alias, or the number of aliases, is not valid.
     */
    upsert = (
        aliases: IWorkspaceAlias[],
        input: IWorkspaceAliasInput,
        now: number,
    ): IWorkspaceAlias[] => {
        const { name, network } = input;
        const address = this.parseAddress(input.address);
        this.parseNetwork(network);

        const result = validateName(name);

        if (!result.ok) {
            throw new Error(`The name is not valid (${result.reason}).`);
        }

        const alias: IWorkspaceAlias = {
            address,
            name,
            network,
            updatedAt: now,
        };
        const key = this.buildKey(alias);
        const others = aliases.filter(
            (stored) => this.buildKey(stored) !== key,
        );

        if (
            others.length === aliases.length &&
            aliases.length >= this.maxAliasesPerWorkspace
        ) {
            throw new Error(
                `A workspace holds at most ${this.maxAliasesPerWorkspace} aliases.`,
            );
        }

        return [...others, alias];
    };

    remove = (
        aliases: IWorkspaceAlias[],
        params: Pick<IWorkspaceAliasInput, 'address' | 'network'>,
    ) => {
        const key = this.buildKey(params);

        return aliases.filter((alias) => this.buildKey(alias) !== key);
    };

    private parseAlias = (
        record: unknown,
        importedAt: number,
    ): IWorkspaceAlias => {
        if (
            record == null ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            throw new Error('An alias must be an object.');
        }

        const keys = Object.keys(record);

        if (
            keys.length !== aliasKeys.length ||
            !keys.every((key) => aliasKeys.includes(key))
        ) {
            throw new Error('An alias has missing or unknown fields.');
        }

        const { address, name, network, updatedAt } = record as Record<
            string,
            unknown
        >;

        if (
            typeof name !== 'string' ||
            name.length > this.maxStoredNameLength
        ) {
            throw new Error('The name of an alias must be a short text.');
        }

        if (
            typeof updatedAt !== 'number' ||
            !Number.isFinite(updatedAt) ||
            updatedAt < 0
        ) {
            throw new Error('The time of an alias must be a positive number.');
        }

        return {
            address: this.parseAddress(address),
            name,
            network: this.parseNetwork(network),
            updatedAt: Math.min(updatedAt, importedAt),
        };
    };

    // A mixed-case address must match its checksum; an all-lowercase one is accepted and checksummed.
    private parseAddress = (value: unknown): string => {
        if (
            typeof value !== 'string' ||
            !addressUtils.isAddress(value, { strict: true })
        ) {
            throw new Error('The address of an alias is not valid.');
        }

        return addressUtils.getChecksum(value);
    };

    private parseNetwork = (value: unknown): Network | null => {
        if (value === null) {
            return null;
        }

        if (!networkUtils.isValidNetwork(value)) {
            throw new Error('The network of an alias is not supported.');
        }

        return value as Network;
    };

    private buildKey = (
        params: Pick<IWorkspaceAliasInput, 'address' | 'network'>,
    ) => `${params.address.toLowerCase()}:${params.network ?? ''}`;
}

export const workspaceAliasUtils = new WorkspaceAliasUtils();
