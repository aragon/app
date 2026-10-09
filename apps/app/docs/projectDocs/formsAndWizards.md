# Forms and wizards

How App form inputs, wizards and dialogs compose. Kit component contracts live with the kit
(`packages/gov-ui-kit`); this page covers the App layer on top of them.

## Form context

- `Wizard.Root` (`src/shared/components/wizards/wizard/wizardRoot`) calls `useForm` and renders
  `FormProvider`. `WizardPage.Container` and `WizardDialog.Container` compose `Wizard.Root` with
  `Wizard.Form`, so a wizard step already has form context.
- Do not add a second form provider inside a wizard. Inputs under it write to a form the wizard
  never reads: its validation gates and submit payload silently lose those fields. Seed values
  through the container's `defaultValues`.
- `AddressesInput`, `AdvancedDateInput`, `AvatarInput`, `NumberProgressInput` and `ResourcesInput`
  read react-hook-form context. `AutocompleteInput` does not: it is controlled through
  `value`/`onChange`.
- `AddressesInput` rows hydrate from the form's default values. `ResourcesInput` also accepts its
  own `defaultValue`.
- In tests, wrap form-backed inputs in `FormWrapper` (`src/shared/testUtils/formWrapper.tsx`).

## Address lists

`AddressesInput` owns required, duplicate and form-level validation through
`addressesListUtils.validateAddress`; don't replace it with a single-input callback.

A mis-checksummed address reaches the form as a missing one. The kit `AddressInput` enforces
EIP-55 by default (`enforceChecksum`), and on a checksum error it calls `onAccept(undefined)`.
`AddressesInputItem` stores `{ address: undefined }`, so `validateAddress` reports
`app.shared.addressesInput.item.input.error.invalid`, not a checksum-specific error.

## Wizard exit and dialogs

- `BlockNavigationContextProvider` backs the dirty-exit confirmation (`useConfirmWizardExit`).
  Its default context is a no-op, so leaving it out disables the guard instead of throwing.
- `DialogProvider`'s `close(dialogId)` closes one dialog and returns to its parent; `close()`
  with no id closes the whole stack.
