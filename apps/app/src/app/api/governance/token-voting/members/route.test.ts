/** @jest-environment node */

import type { NextRequest } from 'next/server';
import { tokenVotingMembershipServiceServer } from '@/modules/governance/api/tokenVotingMembershipService/tokenVotingMembershipService.server';
import { GET } from './route';

const daoId = 'ethereum-mainnet-0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const validQuery = `daoId=${daoId}&pluginAddress=${pluginAddress}`;

const generateRequest = (query: string): NextRequest =>
    ({
        nextUrl: new URL(
            `http://localhost/api/governance/token-voting/members?${query}`,
        ),
    }) as NextRequest;

describe('GET /api/governance/token-voting/members', () => {
    const getMembershipSpy = jest.spyOn(
        tokenVotingMembershipServiceServer,
        'getTokenVotingMembership',
    );

    afterEach(() => {
        getMembershipSpy.mockReset();
    });

    it.each([
        ['a missing dao id', `pluginAddress=${pluginAddress}`],
        ['a malformed dao id', `daoId=dao-id&pluginAddress=${pluginAddress}`],
        ['a missing plugin address', `daoId=${daoId}`],
        [
            'an invalid plugin address',
            `daoId=${daoId}&pluginAddress=not-an-address`,
        ],
        ['a non-integer page', `${validQuery}&page=first`],
        ['a non-positive page size', `${validQuery}&pageSize=0`],
        ['a page size above the maximum', `${validQuery}&pageSize=251`],
    ])('returns 400 for %s', async (_label, query) => {
        const response = await GET(generateRequest(query));

        expect(response.status).toBe(400);
        expect(getMembershipSpy).not.toHaveBeenCalled();
    });

    it('forwards a valid request to the membership service', async () => {
        const page = {
            data: [],
            metadata: { page: 1, pageSize: 10, totalPages: 1, totalRecords: 0 },
            source: 'backend' as const,
        };
        getMembershipSpy.mockResolvedValue(page);

        const response = await GET(
            generateRequest(`${validQuery}&page=2&pageSize=10&source=domain`),
        );

        expect(getMembershipSpy).toHaveBeenCalledWith({
            queryParams: {
                daoId,
                pluginAddress,
                page: 2,
                pageSize: 10,
                source: 'domain',
            },
        });
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual(page);
    });

    it('returns 500 when the membership service fails', async () => {
        getMembershipSpy.mockRejectedValue(new Error('request failed'));

        const response = await GET(generateRequest(validQuery));

        expect(response.status).toBe(500);
    });
});
