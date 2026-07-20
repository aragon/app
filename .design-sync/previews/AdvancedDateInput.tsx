import {
    AdvancedDateInput,
    DebugContextProvider,
    enTranslations,
    FormWrapper,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppForm = (props: {
    children?: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            <FormWrapper defaultValues={props.defaultValues}>
                {props.children}
            </FormWrapper>
        </TranslationsProvider>
    </DebugContextProvider>
);

// minTime is only consumed by the "fixed" branch, which needs a luxon DateTime
// (not exported by the bundle) — previews stay on the "now" / "duration" modes.
const unusedMinTime = undefined as never;

export const Default = () => (
    <AppForm>
        <AdvancedDateInput
            field="startTime"
            helpText="Define when the proposal opens for voting."
            label="Start time"
            minTime={unusedMinTime}
        />
    </AppForm>
);

export const Duration = () => (
    <AppForm>
        <AdvancedDateInput
            field="votingPeriod"
            helpText="Members can vote until the period ends."
            label="Voting period"
            minDuration={{ days: 7, hours: 0, minutes: 0 }}
            minTime={unusedMinTime}
            useDuration={true}
        />
    </AppForm>
);

export const DurationWithInfo = () => (
    <AppForm>
        <AdvancedDateInput
            field="stageExpiration"
            helpText="How long this stage stays open for approvals."
            infoText="The stage advances as soon as the approval threshold is met."
            label="Stage expiration"
            minDuration={{ days: 3, hours: 0, minutes: 0 }}
            minTime={unusedMinTime}
            useDuration={true}
        />
    </AppForm>
);
