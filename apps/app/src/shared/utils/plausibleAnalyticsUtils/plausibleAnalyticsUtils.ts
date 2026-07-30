import { analyticsUtils } from '@/shared/utils/analyticsUtils';

export type PlausibleAnalyticsEventName =
    | 'wizard_start'
    | 'wizard_submit'
    | 'wizard_step'
    | 'wizard_validation_blocked'
    | 'action_added'
    | 'action_added_batch'
    | 'transaction_start'
    | 'transaction_stage'
    | 'transaction_end'
    | 'transaction_failed';

export type PlausibleAnalyticsPropValue = string | number | boolean;

export type PlausibleAnalyticsProps = Record<
    string,
    PlausibleAnalyticsPropValue | null | undefined
>;

/**
 * Typed event catalog for the app's product analytics. This is the taxonomy layer owned by the
 * app (event names + payload shapes); the underlying transport/pipeline is `analyticsUtils`
 * (Plausible tracker + proxied endpoint). Keeping the catalog here gives compile-time safety on
 * event names and centralizes payload hygiene, so a typo can't silently mint a junk goal.
 */
class PlausibleAnalyticsUtils {
    track = (
        eventName: PlausibleAnalyticsEventName,
        props?: PlausibleAnalyticsProps,
    ) => {
        analyticsUtils.trackEvent(eventName, this.normalizeProps(props));
    };

    // Plausible props are string-valued on the wire, so coerce numbers/booleans and drop nullish
    // entries. Returns undefined when nothing remains so the tracker sends a bare event.
    private normalizeProps = (props?: PlausibleAnalyticsProps) => {
        if (props == null) {
            return undefined;
        }

        const entries = Object.entries(props)
            .filter(([, value]) => value != null)
            .map(([key, value]) => [key, String(value)] as const);

        return entries.length === 0 ? undefined : Object.fromEntries(entries);
    };
}

export const plausibleAnalyticsUtils = new PlausibleAnalyticsUtils();
