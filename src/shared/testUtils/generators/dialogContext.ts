import type { IDialogContext } from '@/shared/components/dialogProvider';

export const generateDialogContext = (values?: Partial<IDialogContext>): IDialogContext => {
    const { location, locations, ...rest } = values ?? {};
    
    // If location is provided but not locations, create locations array from location
    const finalLocations = locations ?? (location ? [location] : []);
    const finalLocation = finalLocations.length > 0 ? finalLocations[finalLocations.length - 1] : undefined;
    
    return {
        open: jest.fn(),
        close: jest.fn(),
        updateOptions: jest.fn(),
        locations: finalLocations,
        location: finalLocation,
        ...rest,
    };
};
