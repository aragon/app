import { generateLinkedAccount } from '@/shared/testUtils';
import {
    normalizeDaoResponse,
    normalizeRequestParams,
} from './apiCompatAdapter';

describe('apiCompatAdapter', () => {
    it('maps legacy subDaos field to linkedAccounts', () => {
        const legacyAccount = generateLinkedAccount({ id: 'linked-1' });
        const normalized = normalizeDaoResponse({
            id: 'dao-1',
            subDaos: [legacyAccount],
        });

        expect(normalized.linkedAccounts).toEqual([legacyAccount]);
        expect('subDaos' in normalized).toBe(false);
    });

    it('keeps linkedAccounts when both fields are present', () => {
        const newAccount = generateLinkedAccount({ id: 'linked-new' });
        const oldAccount = generateLinkedAccount({ id: 'linked-old' });
        const normalized = normalizeDaoResponse({
            id: 'dao-1',
            linkedAccounts: [newAccount],
            subDaos: [oldAccount],
        });

        expect(normalized.linkedAccounts).toEqual([newAccount]);
    });

    it('maps includeLinkedAccounts to includeSubDaos', () => {
        const normalized = normalizeRequestParams({
            daoId: 'dao-1',
            includeLinkedAccounts: true,
        });

        const includeSubDaos: boolean | undefined = normalized.includeSubDaos;

        expect(includeSubDaos).toBe(true);
        expect('includeLinkedAccounts' in normalized).toBe(false);
    });

    it('preserves includeSubDaos when includeLinkedAccounts is missing', () => {
        const normalized = normalizeRequestParams({
            daoId: 'dao-1',
            includeSubDaos: false,
        });

        expect(normalized.includeSubDaos).toBe(false);
    });
});
