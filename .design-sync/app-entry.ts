/**
 * design-sync slice-3 entry — the app's shared design layer, merged into the
 * synced bundle via cfg.extraEntries. Curated surface: extractable components
 * only. Deliberately excluded (need the live app runtime): TransactionDialog,
 * PluginFilterComponent, DaoFilterComponent, ManageMembershipAddressList,
 * RedirectToUrl, FeatureFlagsProvider, Navigation (usePathname), app Link
 * (name-collides with kit Link; router-coupled), Image (next/image),
 * PluginSingleComponent (needs populated plugin registry), PolicyDataListItem
 * (policyDisplayUtils drags the capitalFlow module tree), Page.Error
 * (monitoringUtils → @sentry/nextjs), GovernanceBodyInfo and
 * ProcessDataListItem (daoUtils → daoService api tree → sentry → next server).
 */

import './process-shim';

// Wizards — the app's flagship interaction patterns
export { Wizard } from '@/shared/components/wizards/wizard';
export { WizardPage } from '@/shared/components/wizards/wizardPage';
export { WizardDialog } from '@/shared/components/wizards/wizardDialog';
export { WizardDetailsDialog } from '@/shared/components/wizardDetailsDialog';

// Layout & page scaffolding.
// Page is re-composed here WITHOUT Page.Error — pageError imports
// monitoringUtils → @sentry/nextjs → Next server internals (unbundlable).
import { PageAside } from '@/shared/components/page/pageAside';
import { PageAsideCard } from '@/shared/components/page/pageAsideCard';
import { PageContainer } from '@/shared/components/page/pageContainer';
import { PageContent } from '@/shared/components/page/pageContent';
import { PageHeader } from '@/shared/components/page/pageHeader';
import { PageMain } from '@/shared/components/page/pageMain';
import { PageMainSection } from '@/shared/components/page/pageMainSection';

export const Page = {
    Container: PageContainer,
    Header: PageHeader,
    Content: PageContent,
    Main: PageMain,
    Aside: PageAside,
    MainSection: PageMainSection,
    AsideCard: PageAsideCard,
};

export { Container } from '@/shared/components/container';

// Presentational
export { AragonLogo } from '@/shared/components/aragonLogo';
export { Banner } from '@/shared/components/banner';
export { Carousel } from '@/shared/components/carousel';
export { CtaCard } from '@/shared/components/ctaCard';
export { StatCard } from '@/shared/components/statCard';
export { DaoTargetIndicator } from '@/shared/components/daoTargetIndicator';
export { DaoTypeTag } from '@/shared/components/daoTypeTag';
export { ErrorFeedback } from '@/shared/components/errorFeedback';
export { FooterInfo } from '@/shared/components/footerInfo';
export { KeyboardShortcut } from '@/shared/components/keyboardShortcut';
export { NetworkSwitchAlert } from '@/shared/components/networkSwitchAlert';
export { ResourceLink } from '@/shared/components/resourceLink';
export { SafeDocumentParser } from '@/shared/components/SafeDocumentParser';
export { SafeHtml } from '@/shared/components/SafeHtml';
// Renamed: the kit exports a `TransactionStatus` ENUM (tx states) that would
// shadow this component on the bundle global and in the type index.
export { TransactionStatus as AppTransactionStatus } from '@/shared/components/transactionStatus';

// Form building blocks (compose inside react-hook-form FormProvider)
export { AddressesInput } from '@/shared/components/forms/addressesInput';
export { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
export { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
export { AvatarInput } from '@/shared/components/forms/avatarInput';
export { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
export { ResourcesInput } from '@/shared/components/forms/resourcesInput';

// App infrastructure providers (wrap app components with these)
export { TranslationsProvider, useTranslations } from '@/shared/components/translationsProvider';
export { DebugContextProvider } from '@/shared/components/debugProvider';
export { DialogProvider, useDialogContext } from '@/shared/components/dialogProvider';
export { DialogRoot as AppDialogRoot } from '@/shared/components/dialogRoot';
export { BlockNavigationContextProvider } from '@/shared/components/blockNavigationContext';

// Real locale strings for TranslationsProvider (previews + designs use these)
export { default as enTranslations } from '@/assets/locales/en.json';

// react-hook-form context for the form components above. Lives in the bundle
// so it shares the bundle's react-hook-form instance — composing FormProvider
// from a separately-bundled copy would break the context.
import { createElement, type ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

export function FormWrapper(props: { children?: ReactNode; defaultValues?: Record<string, unknown> }) {
    const methods = useForm({ defaultValues: props.defaultValues, mode: 'onTouched' });
    return createElement(FormProvider, methods, props.children);
}
