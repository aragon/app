/** @jest-environment node */

import type { NextRequest } from 'next/server';
import { tokenVotingMembershipServiceServer } from '@/modules/governance/api/tokenVotingMembershipService/tokenVotingMembershipService.server';
import { GET } from './route';

const pluginAddress = '0x1111111111111111111111111111111111111111';
const tokenContractAddress = '0x2222222222222222222222222222222222222222';

const generateRequest = (query: string): NextRequest =>
    ({
        nextUrl: new URL(
            `http://localhost/api/domain/token-voting/members?${query}`,
        ),
    }) as NextRequest;

describe('GET /api/domain/token-voting/members', () => {
    const getMembershipSpy = jest.spyOn(
        tokenVotingMembershipServiceServer,
        'getTokenVotingMembership',
    );

    afterEach(() => {
        getMembershipSpy.mockReset();
    });

    it.each([
        [
            'a missing plugin address',
            `tokenContractAddress=${tokenContractAddress}`,
        ],
        [
            'an invalid plugin address',
            `pluginAddress=not-an-address&tokenContractAddress=${tokenContractAddress}`,
        ],
        [
            'an invalid token contract address',
            `pluginAddress=${pluginAddress}&tokenContractAddress=0x1234`,
        ],
        [
            'a non-integer page',
            `pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}&page=first`,
        ],
        [
            'a non-positive page size',
            `pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}&pageSize=0`,
        ],
        [
            'a page size above the domain maximum',
            `pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}&pageSize=251`,
        ],
    ])('returns 400 for %s', async (_label, query) => {
        const response = await GET(generateRequest(query));

        expect(response.status).toBe(400);
        expect(getMembershipSpy).not.toHaveBeenCalled();
    });

    it('passes validated request parameters to the domain service', async () => {
        const result = {
            data: [],
            metadata: { page: 2, pageSize: 25, totalPages: 0, totalRecords: 0 },
        };
        getMembershipSpy.mockResolvedValue(result);

        const response = await GET(
            generateRequest(
                `pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}&page=2&pageSize=25`,
            ),
        );

        expect(response.status).toBe(200);
        expect(getMembershipSpy).toHaveBeenCalledWith({
            queryParams: {
                pluginAddress,
                tokenContractAddress,
                page: 2,
                pageSize: 25,
            },
        });
        await expect(response.json()).resolves.toEqual(result);
    });
});
