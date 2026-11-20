import { checkBotId } from 'botid/server';
import { headers } from 'next/headers';
import { monitoringUtils } from '../monitoringUtils';
import { botIdUtils } from './botIdUtils';

jest.mock('next/headers', () => ({ headers: jest.fn() }));

describe('botId utils', () => {
    const checkBotIdMock = checkBotId as jest.Mock;
    const headersMock = headers as jest.Mock;
    const incrementCounterSpy = jest.spyOn(monitoringUtils, 'incrementCounter');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

    const mockRequestHeaders = (values: Record<string, string>) =>
        headersMock.mockResolvedValue({
            get: (name: string) => values[name] ?? null,
        });

    beforeEach(() => {
        mockRequestHeaders({});
    });

    afterEach(() => {
        checkBotIdMock.mockReset();
        headersMock.mockReset();
        incrementCounterSpy.mockReset();
        logErrorSpy.mockReset();
    });

    describe('shouldReject', () => {
        it('returns false and counts nothing for a human request', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: false });
            await expect(
                botIdUtils.shouldReject('rpc', { onError: 'allow' }),
            ).resolves.toBe(false);
            expect(incrementCounterSpy).not.toHaveBeenCalled();
        });

        it('runs the basic check level regardless of the project setting', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: false });
            await botIdUtils.shouldReject('rpc', { onError: 'allow' });
            expect(checkBotIdMock).toHaveBeenCalledWith({
                advancedOptions: { checkLevel: 'basic' },
            });
        });

        it.each([
            ['no-challenge', {}],
            ['rejected', { 'x-is-human': '{"b":0,"d":0}' }],
        ])(
            'returns true and counts a blocked request with the source and the %s stage',
            async (stage, requestHeaders) => {
                checkBotIdMock.mockResolvedValue({ isBot: true });
                mockRequestHeaders(requestHeaders);
                await expect(
                    botIdUtils.shouldReject('backend', { onError: 'allow' }),
                ).resolves.toBe(true);
                expect(incrementCounterSpy).toHaveBeenCalledWith(
                    'botid.detection',
                    { source: 'backend', stage, action: 'blocked' },
                );
            },
        );

        it('lets a request that failed the challenge through when the options allow it, and counts it', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: true });
            mockRequestHeaders({ 'x-is-human': '{"b":0,"d":0}' });
            await expect(
                botIdUtils.shouldReject('rpc', {
                    onError: 'allow',
                    onFailedChallenge: 'allow',
                }),
            ).resolves.toBe(false);
            expect(incrementCounterSpy).toHaveBeenCalledWith(
                'botid.detection',
                { source: 'rpc', stage: 'rejected', action: 'allowed' },
            );
        });

        it('rejects a request without the challenge even when a failed challenge is allowed', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: true });
            await expect(
                botIdUtils.shouldReject('rpc', {
                    onError: 'allow',
                    onFailedChallenge: 'allow',
                }),
            ).resolves.toBe(true);
        });

        it.each([
            ['allow', false],
            ['reject', true],
        ] as const)(
            'resolves a failed check with the %s policy and logs the error',
            async (onError, expected) => {
                const error = new Error('BotID classification unavailable');
                checkBotIdMock.mockRejectedValue(error);
                await expect(
                    botIdUtils.shouldReject('rpc', { onError }),
                ).resolves.toBe(expected);
                expect(logErrorSpy).toHaveBeenCalledWith(error, {
                    context: { module: 'botIdUtils', source: 'rpc' },
                });
                expect(incrementCounterSpy).not.toHaveBeenCalled();
            },
        );
    });

    describe('assertHuman', () => {
        it('resolves for a human request', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: false });
            await expect(
                botIdUtils.assertHuman('pin'),
            ).resolves.toBeUndefined();
        });

        it('throws for an automated request', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: true });
            await expect(botIdUtils.assertHuman('pin')).rejects.toThrow(
                'automated request rejected (pin)',
            );
        });

        it('throws when the check itself fails', async () => {
            checkBotIdMock.mockRejectedValue(new Error('down'));
            await expect(botIdUtils.assertHuman('pin')).rejects.toThrow(
                'automated request rejected (pin)',
            );
        });
    });
});
