import { generateTokenPluginSettingsToken } from '../../testUtils';
import { tokenPluginUtils } from './tokenPluginUtils';

describe('tokenPluginUtils', () => {
    describe('getUnderlyingToken', () => {
        it('returns the token unchanged when underlying is null', () => {
            const token = generateTokenPluginSettingsToken({
                underlying: null,
            });
            const result = tokenPluginUtils.getUnderlyingToken(token);
            expect(result).toEqual(token);
        });

        it('returns token with underlying address when underlying is set', () => {
            const underlyingAddress = '0xUnderlyingAddress';
            const token = generateTokenPluginSettingsToken({
                underlying: underlyingAddress,
            });
            const result = tokenPluginUtils.getUnderlyingToken(token);
            expect(result.address).toBe(underlyingAddress);
        });

        it('strips the leading "g" prefix from the symbol and the "Governance " prefix from the name', () => {
            const token = generateTokenPluginSettingsToken({
                underlying: '0xUnderlyingAddress',
                symbol: 'gTKN',
                name: 'Governance Token',
            });
            const result = tokenPluginUtils.getUnderlyingToken(token);
            expect(result.symbol).toBe('TKN');
            expect(result.name).toBe('Token');
        });

        it('preserves all other token fields', () => {
            const token = generateTokenPluginSettingsToken({
                underlying: '0xUnderlyingAddress',
                decimals: 18,
            });
            const result = tokenPluginUtils.getUnderlyingToken(token);
            expect(result.decimals).toBe(18);
        });
    });
});
