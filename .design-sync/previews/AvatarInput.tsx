import {
    AvatarInput,
    DebugContextProvider,
    enTranslations,
    FormWrapper,
    TranslationsProvider,
} from '@aragon/gov-ui-kit';

const AppForm = (props: { children?: React.ReactNode; defaultValues?: Record<string, unknown> }) => (
    <DebugContextProvider>
        <TranslationsProvider translations={enTranslations as never}>
            <FormWrapper defaultValues={props.defaultValues}>{props.children}</FormWrapper>
        </TranslationsProvider>
    </DebugContextProvider>
);

const daoLogoUrl =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='%233B82F6'/><circle cx='32' cy='32' r='14' fill='white'/></svg>";

export const Default = () => (
    <AppForm>
        <AvatarInput name="avatar" />
    </AppForm>
);

export const WithValue = () => (
    <AppForm>
        <AvatarInput
            defaultValue={{ url: daoLogoUrl }}
            helpText="Square images of at least 256×256px work best."
            label="DAO logo"
            name="avatar"
        />
    </AppForm>
);

export const Required = () => (
    <AppForm>
        <AvatarInput
            helpText="JPG, PNG or SVG of max. 1MiB."
            isOptional={false}
            label="Token icon"
            name="tokenIcon"
        />
    </AppForm>
);
