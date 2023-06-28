import {
  AlertInline,
  ButtonText,
  CheckboxSimple,
  IconReload,
  Label,
  LinearProgress,
  Spinner,
  ValueInput,
} from '@aragon/ui-components';
import React, {useCallback, useMemo, FC} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {validateTokenAmount} from 'utils/validators';
import {
  Controller,
  UseFormReturn,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {StateEmpty} from 'components/stateEmpty';
import {Erc20TokenDetails} from '@aragon/sdk-client';
import type {WrappingFormParams} from 'context/govTokensWrapping';
import {gTokenSymbol} from 'utils/tokens';

interface GovTokensWrappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  daoToken: Erc20TokenDetails | undefined;
  wrappedDaoToken: Erc20TokenDetails | undefined;
  balances: {
    wrapped: string;
    unwrapped: string;
  };
  form: UseFormReturn<WrappingFormParams, object>;
  isFinished: boolean;
  currentStep: number;
  isTxLoading: boolean;
  isTxError: boolean;
  handleApprove: () => void;
  handleWrap: () => void;
  handleAddWrappedTokenToWallet: () => void;
  handleUnwrap: () => void;
}

const GovTokensWrappingModal: FC<GovTokensWrappingModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  daoToken,
  wrappedDaoToken,
  balances,
  form,
  isFinished,
  currentStep,
  isTxLoading,
  isTxError,
  handleApprove,
  handleWrap,
  handleAddWrappedTokenToWallet,
  handleUnwrap,
}) => {
  const {t} = useTranslation();

  const {isValid, dirtyFields} = useFormState({control: form.control});

  const [mode, amount] = useWatch({
    name: ['mode', 'amount'],
    control: form.control,
  });
  const isWrapMode = mode === 'wrap';

  const isTokenApproveLoading = isTxLoading && currentStep === 1 && isWrapMode;
  const isTokenWrapLoading = isTxLoading && currentStep === 2 && isWrapMode;
  const isTokenUnwrapLoading = isTxLoading && currentStep === 1 && !isWrapMode;

  const isTokenApproveError = isTxError && currentStep === 1 && isWrapMode;
  const isTokenWrapError = isTxError && currentStep === 2 && isWrapMode;
  const isTokenUnwrapError = isTxError && currentStep === 1 && !isWrapMode;

  const isUserInputDisabled =
    isTokenApproveLoading || isTokenWrapLoading || isTokenUnwrapLoading;
  const isUserInputValid = dirtyFields['amount'] && isValid;

  const modeData = useMemo(() => {
    const targetToken = isWrapMode ? daoToken : wrappedDaoToken;
    const tokenBalance = isWrapMode ? balances.unwrapped : balances.wrapped;
    const tokenSymbol = targetToken?.symbol || 'ANT';

    let title = t('modal.wrapToken.title');
    let subtitle = t('modal.wrapToken.desc', {
      tokenSymbol,
      gTokenSymbol: tokenSymbol,
    });

    const finishedTitle = isWrapMode
      ? t('modal.wrapToken.successTitle')
      : t('modal.unwrapToken.successTitle');
    const finishedDescription = isWrapMode
      ? t('modal.wrapToken.successDesc', {
          amount,
          gTokenSymbol: gTokenSymbol(tokenSymbol),
        })
      : t('modal.unwrapToken.successDesc', {
          amount,
          tokenSymbol,
        });

    if (isFinished) {
      title = '';
      subtitle = '';
    }

    const wrapSteps = [
      {
        title: t('modal.wrapToken.footerTitle'),
        helpText: t('modal.wrapToken.footerDesc', {tokenSymbol}),
      },
      {
        title: t('modal.wrapToken.footerTitle'),
        helpText: t('modal.wrapToken.footerDesc', {tokenSymbol}),
      },
    ];

    const userBalanceDisplay = isWrapMode
      ? t('modal.wrapToken.inputAmountBalance', {
          amount: balances.unwrapped,
          tokenSymbol,
        })
      : t('modal.wrapToken.inputAmountBalanceWrapped', {
          amount: balances.wrapped,
          tokenSymbol,
        });

    return {
      targetToken,
      tokenBalance,
      title,
      subtitle,
      steps: isWrapMode ? wrapSteps : [],
      finishedTitle,
      finishedDescription,
      userBalanceDisplay,
    };
  }, [
    amount,
    balances.unwrapped,
    balances.wrapped,
    daoToken,
    isFinished,
    isWrapMode,
    t,
    wrappedDaoToken,
  ]);

  /* Token amount field handling */
  const amountValidator = useCallback(
    async (tokenAmount: string) => {
      if (!modeData.targetToken) return '';
      return validateTokenAmount(
        tokenAmount,
        modeData.targetToken.decimals,
        modeData.tokenBalance
      );
    },
    [modeData.targetToken, modeData.tokenBalance]
  );

  const handleMaxClicked = useCallback(
    onChange => {
      if (modeData.tokenBalance) {
        onChange(modeData.tokenBalance);
      }
    },
    [modeData.tokenBalance]
  );

  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={onClose}
      title={modeData.title}
      subtitle={modeData.subtitle}
    >
      {isLoading ? (
        <Container>
          <LoadingContainer>
            <Spinner size="big" />
            <LoadingLabel>{t('labels.loading')}</LoadingLabel>
          </LoadingContainer>
        </Container>
      ) : isFinished ? (
        <StateEmpty
          customCardPaddingClassName="p-3"
          type="Human"
          mode="card"
          body="elevating"
          expression="smile_wink"
          sunglass="big_rounded"
          hair="middle"
          accessory="buddha"
          title={modeData.finishedTitle}
          description={modeData.finishedDescription}
          primaryButton={{
            label: isWrapMode
              ? t('modal.wrapToken.successCtaLabel')
              : t('modal.unwrapToken.successCtaLabel'),
            className: 'w-full',
            onClick: onClose,
          }}
          secondaryButton={
            isWrapMode
              ? {
                  label: t('modal.wrapToken.successBtnSecondaryLabel'),
                  className: 'w-full',
                  onClick: handleAddWrappedTokenToWallet,
                }
              : undefined
          }
        />
      ) : (
        <Container>
          <BodyWrapper>
            <form {...form} className="space-y-3">
              {/* Action selection */}
              <FormItem>
                <Label label={t('modal.wrapToken.inputModeLabel')} />
                <Controller
                  name="mode"
                  control={form.control}
                  defaultValue="wrap"
                  render={({field: {onChange, value}}) => (
                    <ModeActionSelection>
                      <CheckboxSimple
                        state={value === 'wrap' ? 'active' : 'default'}
                        disabled={isUserInputDisabled}
                        label={t('modal.wrapToken.inputSelectWrap')}
                        multiSelect={false}
                        onClick={() => onChange('wrap')}
                      />
                      <CheckboxSimple
                        state={value === 'unwrap' ? 'active' : 'default'}
                        disabled={isUserInputDisabled}
                        label={t('modal.wrapToken.inputSelectUnwrap')}
                        multiSelect={false}
                        onClick={() => onChange('unwrap')}
                      />
                    </ModeActionSelection>
                  )}
                />
              </FormItem>

              {/* Token amount */}
              <FormItem>
                <Label label={t('modal.wrapToken.inputAmountLabel')} />
                <Controller
                  name={'amount'}
                  control={form.control}
                  defaultValue=""
                  rules={{
                    required: t('errors.required.amount'),
                    validate: amountValidator,
                  }}
                  render={({
                    field: {name, onBlur, onChange, value},
                    fieldState: {error},
                  }) => (
                    <>
                      <TokenAmountInput
                        mode={error ? 'critical' : 'default'}
                        name={name}
                        disabled={isUserInputDisabled}
                        type="number"
                        value={value}
                        placeholder="0"
                        onBlur={onBlur}
                        onChange={onChange}
                        adornmentText={t('labels.max')}
                        onAdornmentClick={() => handleMaxClicked(onChange)}
                      />
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          {error?.message && (
                            <AlertInline
                              label={error.message}
                              mode="critical"
                            />
                          )}
                        </div>
                        {modeData.tokenBalance && (
                          <TokenBalance>
                            {modeData.userBalanceDisplay}
                          </TokenBalance>
                        )}
                      </div>
                    </>
                  )}
                />
              </FormItem>
            </form>

            {/* Progress Bar */}
            {!!modeData.steps.length && (
              <ProgressContainer>
                <ProgressHeader>
                  <ProgressTitle>
                    {modeData.steps[currentStep - 1].title}
                  </ProgressTitle>
                  <ProgressSteps>
                    {t('modal.wrapToken.footerSteps', {
                      step: currentStep,
                      steps: modeData.steps.length,
                    })}
                  </ProgressSteps>
                </ProgressHeader>
                <LinearProgress
                  value={currentStep}
                  max={modeData.steps.length}
                />
                <ProgressHelpText>
                  {modeData.steps[currentStep - 1].helpText}
                </ProgressHelpText>
              </ProgressContainer>
            )}

            {/* User button actions */}
            <ActionsContainer>
              {isWrapMode ? (
                <>
                  <ButtonText
                    mode="primary"
                    isActive={isTokenApproveLoading}
                    disabled={!isUserInputValid || currentStep !== 1}
                    iconLeft={
                      isTokenApproveLoading ? (
                        <Spinner size="xs" color="white" />
                      ) : isTokenApproveError ? (
                        <IconReload />
                      ) : undefined
                    }
                    size="large"
                    label={
                      isTokenApproveError
                        ? t('modal.wrapToken.footerCtaError')
                        : t('modal.wrapToken.footerCtaFirst')
                    }
                    className="w-full"
                    onClick={handleApprove}
                  />
                  <ButtonText
                    mode="primary"
                    isActive={isTokenWrapLoading}
                    disabled={!isUserInputValid || currentStep !== 2}
                    iconLeft={
                      isTokenWrapLoading ? (
                        <Spinner size="xs" color="white" />
                      ) : isTokenWrapError ? (
                        <IconReload />
                      ) : undefined
                    }
                    size="large"
                    label={
                      isTokenWrapError
                        ? t('modal.wrapToken.footerCtaError')
                        : t('modal.wrapToken.footerCtaSecond')
                    }
                    className="w-full"
                    onClick={handleWrap}
                  />
                </>
              ) : (
                <>
                  <ButtonText
                    disabled={!isUserInputValid}
                    mode="primary"
                    isActive={isTokenUnwrapLoading}
                    iconLeft={
                      isTokenUnwrapLoading ? (
                        <Spinner size="xs" color="white" />
                      ) : isTokenUnwrapError ? (
                        <IconReload />
                      ) : undefined
                    }
                    size="large"
                    label={
                      isTokenUnwrapError
                        ? t('modal.wrapToken.footerCtaError')
                        : t('modal.wrapToken.footerWrappedCtaLabel')
                    }
                    className="w-full"
                    onClick={handleUnwrap}
                  />
                  <ButtonText
                    mode="secondary"
                    size="large"
                    label={t('modal.wrapToken.footerWrappedCancelLabel')}
                    className="w-full"
                    onClick={onClose}
                  />
                </>
              )}
            </ActionsContainer>

            {isTxError && (
              <div className="flex justify-center text-center">
                <AlertInline
                  label={
                    isTokenApproveError
                      ? t('modal.wrapToken.footerAlertCriticalApprove')
                      : isTokenWrapError
                      ? t('modal.wrapToken.footerAlertCriticalWrap')
                      : isTokenUnwrapError
                      ? t('TransactionModal.errorLabel')
                      : ''
                  }
                  mode="critical"
                />
              </div>
            )}
          </BodyWrapper>
        </Container>
      )}
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-3',
})``;

const BodyWrapper = styled.div.attrs({
  className: 'space-y-3',
})``;

const LoadingContainer = styled.div.attrs({
  className: 'flex flex-col col-span-full gap-3 items-center py-6 w-full',
})``;

const LoadingLabel = styled.span.attrs({
  className: 'text-lg text-center',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const ModeActionSelection = styled.div.attrs({
  className: 'flex gap-3 items-center',
})``;

const TokenBalance = styled.p.attrs({
  className: 'flex-1 px-1 text-xs text-right text-ui-600',
})``;

const TokenAmountInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const ProgressContainer = styled.div.attrs({
  className: 'flex flex-col gap-1',
})``;

const ProgressHeader = styled.div.attrs({
  className: 'flex justify-between items-center ft-text-sm',
})``;

const ProgressTitle = styled.div.attrs({
  className: 'font-bold text-primary-500',
})``;

const ProgressSteps = styled.div.attrs({
  className: 'text-ui-400',
})``;

const ProgressHelpText = styled.div.attrs({
  className: 'ft-text-sm text-ui-600',
})``;

const ActionsContainer = styled.div.attrs({
  className: 'flex gap-2 items-center',
})``;

export default GovTokensWrappingModal;
