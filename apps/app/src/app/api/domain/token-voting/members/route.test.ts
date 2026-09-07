/** @jest-environment node */

import type { NextRequest } from 'next/server';
import { tokenVotingMembershipServiceServer } from '@/modules/governance/api/tokenVotingMembershipService/tokenVotingMembershipService.server';
import { GET } from './route';

const pluginAddress = '0x1111111111111111111111111111111111111111';
const tokenContractAddress = '0x2222222222222222222222222222222222222222';
const validQuery = `chainId=1&pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}`;

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
            'a missing chain id',
            `pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}`,
        ],
        [
            'a non-positive chain id',
            `chainId=0&pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}`,
        ],
        [
            'a non-integer chain id',
            `chainId=mainnet&pluginAddress=${pluginAddress}&tokenContractAddress=${tokenContractAddress}`,
        ],
        [
            'a missing plugin address',
            `chainId=1&tokenContractAddress=${tokenContractAddress}`,
        ],
        [
            'an invalid plugin address',
            `chainId=1&pluginAddress=not-an-address&tokenContractAddress=${tokenContractAddress}`,
        ],
        [
            'an invalid token contract address',
            `chainId=1&pluginAddress=${pluginAddress}&tokenContractAddress=0x1234`,
        ],
        ['a non-integer page', `${validQuery}&page=first`],
        ['a non-positive page size', `${validQuery}&pageSize=0`],
        ['a page size above the domain maximum', `${validQuery}&pageSize=251`],
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
            generateRequest(`${validQuery}&page=2&pageSize=25`),
        );

        expect(response.status).toBe(200);
        expect(getMembershipSpy).toHaveBeenCalledWith({
            queryParams: {
                chainId: 1,
                pluginAddress,
                tokenContractAddress,
                page: 2,
                pageSize: 25,
            },
        });
        await expect(response.json()).resolves.toEqual(result);
    });

    it('returns 500 when the domain service fails', async () => {
        getMembershipSpy.mockRejectedValue(new Error('indexer down'));

        const response = await GET(generateRequest(validQuery));

        expect(response.status).toBe(500);
    });
});
