import { AddressResolutionProvider, addressEntryKey } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as daoService from '@/shared/api/daoService';
import * as useDaoChain from '@/shared/hooks/useDaoChain';
import { generateDao } from '@/shared/testUtils';
import { useSppGovernanceSettingsDefault } from './useSppGovernanceSettingsDefault';

describe('useSppGovernanceSettingsDefault hook', () => {
    const pluginAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const nameTerm = 'app.plugins.spp.sppGovernanceSettings.default.name';
    const addressTerm = 'app.plugins.spp.sppGovernanceSettings.default.address';

    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoChainSpy = jest.spyOn(useDaoChain, 'useDaoChain');

    beforeEach(() => {
        useDaoSpy.mockReturnValue({
            data: generateDao(),
        } as unknown as ReturnType<typeof daoService.useDao>);
        useDaoChainSpy.mockReturnValue({
            buildEntityUrl: () => 'https://explorer/address',
        } as unknown as ReturnType<typeof useDaoChain.useDaoChain>);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoChainSpy.mockReset();
    });

    const renderSettings = (entries = new Map()) => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <AddressResolutionProvider entries={entries}>
                {children}
            </AddressResolutionProvider>
        );

        return renderHook(
            () =>
                useSppGovernanceSettingsDefault({
                    daoId: 'dao-id',
                    pluginAddress,
                    settings: {},
                }),
            { wrapper },
        ).result.current;
    };

    it('adds a name row when the address book names the body', () => {
        const settings = renderSettings(
            new Map([
                [
                    addressEntryKey(pluginAddress, 0),
                    { label: 'Core voting', source: 'workspace' as const },
                ],
            ]),
        );

        expect(settings[0]).toEqual(
            expect.objectContaining({
                term: nameTerm,
                definition: 'Core voting',
            }),
        );
        expect(settings[1]?.term).toEqual(addressTerm);
    });

    it('shows only the address row when the body has no name', () => {
        const settings = renderSettings();

        expect(settings.map((setting) => setting.term)).toEqual([addressTerm]);
    });
});
