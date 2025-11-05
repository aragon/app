/**
 * @jest-environment node
 */

import { generateResponse } from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { responseUtils } from '@/shared/utils/responseUtils';

describe('responseUtils.safeJsonParse', () => {
    beforeEach(() => {
        jest.spyOn(monitoringUtils, 'logError').mockClear();
    });

    describe('204 No Content responses', () => {
        it('should return null for 204 status', async () => {
            const response = generateResponse({ status: 204 });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });
    });

    describe('Non-JSON responses', () => {
        it('should return null for non-JSON content-type', async () => {
            const response = new Response('Hello World', {
                status: 200,
                headers: { 'content-type': 'text/plain' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).toHaveBeenCalledTimes(1);
            const call = (monitoringUtils.logError as jest.Mock).mock.calls[0];
            expect(call[0].name).toBe('SyntaxError');
            expect(call[1]).toEqual({
                context: {
                    errorType: 'json_parse_error',
                    status: 200,
                    url: '',
                    contentType: 'text/plain',
                    bodyPreview: 'Hello World',
                },
            });
        });
    });

    describe('Empty responses', () => {
        it('should return null for empty body', async () => {
            const response = new Response('', {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).toHaveBeenCalledTimes(1);
        });

        it('should return null for whitespace-only body', async () => {
            const response = new Response('   \n\t  ', {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).toHaveBeenCalledTimes(1);
        });
    });

    describe('Valid JSON responses', () => {
        it('should parse valid JSON object', async () => {
            const jsonData = { name: 'John', age: 30 };
            const response = new Response(JSON.stringify(jsonData), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toEqual(jsonData);
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });

        it('should parse valid JSON array', async () => {
            const jsonData = [1, 2, 3, { nested: true }];
            const response = new Response(JSON.stringify(jsonData), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toEqual(jsonData);
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });

        it('should parse valid JSON with application/json; charset=utf-8 content-type', async () => {
            const jsonData = { message: 'Success' };
            const response = new Response(JSON.stringify(jsonData), {
                status: 200,
                headers: { 'content-type': 'application/json; charset=utf-8' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toEqual(jsonData);
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });
    });

    describe('Invalid JSON responses', () => {
        it('should log error and return null for invalid JSON', async () => {
            const invalidJson = '{ "name": "John", "age": }';
            const response = new Response(invalidJson, {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).toHaveBeenCalledTimes(1);
            const call = (monitoringUtils.logError as jest.Mock).mock.calls[0];
            expect(call[0].name).toBe('SyntaxError');
            expect(call[1]).toEqual({
                context: {
                    errorType: 'json_parse_error',
                    status: 200,
                    url: '',
                    contentType: 'application/json',
                    bodyPreview: invalidJson.substring(0, 100),
                },
            });
        });

        it('should log error and return null for malformed JSON', async () => {
            const malformedJson = 'not json at all';
            const response = new Response(malformedJson, {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).toHaveBeenCalledTimes(1);
            const call = (monitoringUtils.logError as jest.Mock).mock.calls[0];
            expect(call[0].name).toBe('SyntaxError');
            expect(call[1]).toEqual({
                context: {
                    errorType: 'json_parse_error',
                    status: 200,
                    url: '',
                    contentType: 'application/json',
                    bodyPreview: malformedJson.substring(0, 100),
                },
            });
        });

        it('should handle very long responses in bodyPreview', async () => {
            const longValidJson = `{ "data": "${'x'.repeat(200)}" }`;
            const response = new Response(longValidJson, {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toEqual({ data: 'x'.repeat(200) });
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });
    });

    describe('Error responses', () => {
        it('should handle 4xx error responses with valid JSON', async () => {
            const errorData = { error: 'Not Found', code: 404 };
            const response = new Response(JSON.stringify(errorData), {
                status: 404,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toEqual(errorData);
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });

        it('should handle 5xx error responses with valid JSON', async () => {
            const errorData = { error: 'Internal Server Error', code: 500 };
            const response = new Response(JSON.stringify(errorData), {
                status: 500,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toEqual(errorData);
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });

        it('should handle error responses with invalid JSON', async () => {
            const invalidErrorJson = 'Server Error';
            const response = new Response(invalidErrorJson, {
                status: 500,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).toHaveBeenCalledTimes(1);
            const call = (monitoringUtils.logError as jest.Mock).mock.calls[0];
            expect(call[0].name).toBe('SyntaxError');
            expect(call[1]).toEqual({
                context: {
                    errorType: 'json_parse_error',
                    status: 500,
                    url: '',
                    contentType: 'application/json',
                    bodyPreview: invalidErrorJson.substring(0, 100),
                },
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle null JSON values', async () => {
            const response = new Response('null', {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBeNull();
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });

        it('should handle boolean JSON values', async () => {
            const response = new Response('true', {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBe(true);
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });

        it('should handle number JSON values', async () => {
            const response = new Response('42', {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBe(42);
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });

        it('should handle string JSON values', async () => {
            const response = new Response('"hello world"', {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
            const result = await responseUtils.safeJsonParse(response);

            expect(result).toBe('hello world');
            expect(monitoringUtils.logError).not.toHaveBeenCalled();
        });
    });
});
