import { checkBotId } from 'botid/server';
import { headers } from 'next/headers';
import { monitoringUtils } from '../monitoringUtils';
import { botIdUtils } from './botIdUtils';

jest.mock('next/headers', () => ({ headers: jest.fn() }));

describe('botId utils', () => {
    const checkBotIdMock = checkBotId as jest.Mock;
    const headersMock = headers as jest.Mock;
    const logMessageSpy = jest.spyOn(monitoringUtils, 'logMessage');
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
        logMessageSpy.mockReset();
        logErrorSpy.mockReset();
    });

    describe('isBot', () => {
        it('returns false and logs nothing for a human request', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: false });
            await expect(
                botIdUtils.isBot('rpc', { onError: 'allow' }),
            ).resolves.toBe(false);
            expect(logMessageSpy).not.toHaveBeenCalled();
        });

        it('runs the basic check level regardless of the project setting', async () => {
            checkBotIdMock.mockResolvedValue({ isBot: false });
            await botIdUtils.isBot('rpc', { onError: 'allow' });
            expect(checkBotIdMock).toHaveBeenCalledWith({
                advancedOptions: { checkLevel: 'basic' },
            });
        });

        it.each([
            ['no-challenge', {}],
            ['rejected', { 'x-is-human': '{"b":0,"d":0}' }],
        ])(
            'returns true and logs a warning tagged with the source and the %s stage',
            async (stage, requestHeaders) => {
                checkBotIdMock.mockResolvedValue({ isBot: true });
                mockRequestHeaders(requestHeaders);
                await expect(
                    botIdUtils.isBot('backend', { onError: 'allow' }),
                ).resolves.toBe(true);
                expect(logMessageSpy).toHaveBeenCalledWith(
                    'BotId: automated request rejected',
                    {
                        level: 'warning',
                        context: { source: 'backend', stage },
                    },
                );
            },
        );

        it.each([
            ['allow', false],
            ['reject', true],
        ] as const)(
            'resolves a failed check with the %s policy and logs the error',
            async (onError, expected) => {
                const error = new Error('BotID classification unavailable');
                checkBotIdMock.mockRejectedValue(error);
                await expect(
                    botIdUtils.isBot('rpc', { onError }),
                ).resolves.toBe(expected);
                expect(logErrorSpy).toHaveBeenCalledWith(error, {
                    context: { module: 'botIdUtils', source: 'rpc' },
                });
                expect(logMessageSpy).not.toHaveBeenCalled();
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
