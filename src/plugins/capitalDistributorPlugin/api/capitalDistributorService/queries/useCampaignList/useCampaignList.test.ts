import { capitalDistributorService, useCampaignList } from "@/plugins/capitalDistributorPlugin/api/capitalDistributorService";
import { generateCampaign } from "@/plugins/capitalDistributorPlugin/testUtils/generators";
import { generatePaginatedResponse, ReactQueryWrapper } from "@/shared/testUtils";
import { renderHook, waitFor } from "@testing-library/react";

describe('useCampaignList query', () => {
  const capitalDistributorServiceSpy = jest.spyOn(capitalDistributorService, 'getCampaignsList');

  afterEach(() => {
    capitalDistributorServiceSpy.mockReset();
  });

  it('fetches the campaign list for a user', async () => {
    const campaignsResult = generatePaginatedResponse({ data: [generateCampaign()]})
    capitalDistributorServiceSpy.mockResolvedValue(campaignsResult);

    const queryParams = { memberAddress: '0x123' };
    const { result } = renderHook(() => useCampaignList({ queryParams }), { wrapper: ReactQueryWrapper });

    await waitFor(() => expect(result.current.data?.pages[0]).toEqual(campaignsResult));
  });
});
