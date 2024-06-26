import {generatePath} from 'react-router-dom';
import {Settings} from '../../utils/paths';
import {toDisplayEns} from '../../utils/library';
import {FullScreenStepper, Step} from '../../components/fullScreenStepper';
import CompareSettings from '../compareSettings';
import {
  DefineProposal,
  isValid as defineProposalIsValid,
} from '../defineProposal';
import SetupVotingForm from '../setupVotingForm';
import ReviewProposal from '../reviewProposal';
import React, {useCallback, useState} from 'react';
import {useFormContext, useFormState} from 'react-hook-form';
import {useDaoDetailsQuery} from '../../hooks/useDaoDetails';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from '../../services/aragon-sdk/queries/use-voting-settings';
import {PluginTypes} from '../../hooks/usePluginClient';
import {useDaoToken} from '../../hooks/useDaoToken';
import {useTokenSupply} from '../../hooks/useTokenSupply';
import {
  Action,
  ActionsTypes,
  ActionUpdateGaslessSettings,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
} from '../../utils/types';
import {MultisigWalletField} from '../../components/multisigWallets/row';
import {getSecondsFromDHM} from '../../utils/date';
import {parseUnits} from 'ethers/lib/utils';
import {VotingMode} from '@aragon/sdk-client';
import {useTranslation} from 'react-i18next';
import {useNetwork} from '../../context/network';
import {Loading} from '../../components/temporary';
import {getNewMultisigMembers, getNonEmptyActions} from '../../utils/proposals';
import {useWallet} from 'hooks/useWallet';
import {CreateProposalDialog} from 'containers/createProposalDialog';

export const ProposeSettingsStepper: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {getValues, setValue, control} = useFormContext();
  const {errors, dirtyFields} = useFormState({
    control,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {isConnected, isOnWrongNetwork} = useWallet();

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const {data: pluginSettings, isLoading: settingsLoading} = useVotingSettings({
    pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    pluginType: daoDetails?.plugins[0].id as PluginTypes,
  });

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const handlePublishProposalClick = () => {
    if (isConnected) {
      if (isOnWrongNetwork) {
        open('network');
      } else {
        setIsDialogOpen(true);
      }
    } else {
      open('wallet');
    }
  };

  // filter actions making sure unchanged information is not bundled
  // into the list of actions
  const filterActions = useCallback(
    (actions: Action[]) => {
      const [settingsChanged, metadataChanged] = getValues([
        'areSettingsChanged',
        'isMetadataChanged',
      ]);

      // ignore every action that is not modifying the metadata and voting settings
      let filteredActions = (actions as Array<Action>).filter(action => {
        if (action.name === 'modify_metadata' && metadataChanged) {
          return action;
        } else if (
          (action.name === 'modify_token_voting_settings' ||
            action.name === 'modify_multisig_voting_settings' ||
            action.name === 'modify_gasless_voting_settings') &&
          settingsChanged
        ) {
          return action;
        } else if (
          action.name === 'add_address' ||
          action.name === 'remove_address'
        ) {
          return action;
        }
      });

      filteredActions = getNonEmptyActions(
        filteredActions,
        isMultisigVotingSettings(pluginSettings) ? pluginSettings : undefined,
        isGaslessVotingSettings(pluginSettings) ? pluginSettings : undefined
      );

      return filteredActions;
    },
    [getValues, pluginSettings]
  );

  // Not a fan, but this sets the actions on the form context so that the Action
  // Widget can read them
  const setFormActions = useCallback(async () => {
    const [
      daoName,
      daoSummary,
      daoLogo,
      minimumApproval,
      multisigMinimumApprovals,
      minimumParticipation,
      eligibilityType,
      eligibilityTokenAmount,
      earlyExecution,
      voteReplacement,
      durationDays,
      durationHours,
      durationMinutes,
      resourceLinks,
      tokenDecimals,

      executionExpirationMinutes,
      executionExpirationHours,
      executionExpirationDays,
      committee,
      committeeMinimumApproval,
      actions,
    ] = getValues([
      'daoName',
      'daoSummary',
      'daoLogo',
      'minimumApproval',
      'multisigMinimumApprovals',
      'minimumParticipation',
      'eligibilityType',
      'eligibilityTokenAmount',
      'earlyExecution',
      'voteReplacement',
      'durationDays',
      'durationHours',
      'durationMinutes',
      'daoLinks',
      'tokenDecimals',
      'executionExpirationMinutes',
      'executionExpirationHours',
      'executionExpirationDays',
      'committee',
      'committeeMinimumApproval',
      'actions',
    ]);

    let daoLogoFile = '';

    if (daoDetails && !daoName) return;

    if (daoLogo?.startsWith?.('blob'))
      daoLogoFile = (await fetch(daoLogo).then(r => r.blob())) as string;
    else daoLogoFile = daoLogo;

    const metadataAction: ActionUpdateMetadata = {
      name: 'modify_metadata',
      inputs: {
        name: daoName,
        description: daoSummary,
        avatar: daoLogoFile,
        links: resourceLinks,
      },
    };

    /**
     * Used to delete duplicate actions if you go back and forth between steps, or when editing settings again
     * @param actions
     * @param name
     */
    const actionsReduce = (actions: Action[], name: ActionsTypes) => {
      return actions.filter(action => action.name !== name) as Action[];
    };

    let settingsAction: Action;
    let existingActions: Action[] = [];

    if (isGaslessVotingSettings(pluginSettings)) {
      // Prevent add actions again if you go back and forth between steps
      existingActions = actionsReduce(
        actions,
        'modify_gasless_voting_settings'
      );
      const gaslessSettingsAction: ActionUpdateGaslessSettings = {
        name: 'modify_gasless_voting_settings',
        inputs: {
          token: daoToken,
          totalVotingWeight: tokenSupply?.raw || BigInt(0),

          executionMultisigMembers: getNewMultisigMembers(
            actions,
            (committee as MultisigWalletField[]).map(wallet => wallet.address),
            getValues
          ),
          minTallyApprovals: committeeMinimumApproval,
          minDuration: getSecondsFromDHM(
            durationDays,
            durationHours,
            durationMinutes
          ),
          minTallyDuration: getSecondsFromDHM(
            executionExpirationDays,
            executionExpirationHours,
            executionExpirationMinutes
          ),
          minParticipation: Number(minimumParticipation) / 100,
          supportThreshold: Number(minimumApproval) / 100,
          minProposerVotingPower:
            eligibilityType === 'token'
              ? parseUnits(
                  eligibilityTokenAmount.toString(),
                  tokenDecimals
                ).toBigInt()
              : BigInt(0),
          censusStrategy: '',
          daoTokenAddress: daoToken?.address,
          id: pluginAddress,
        },
      };
      settingsAction = gaslessSettingsAction;
    } else if (isTokenVotingSettings(pluginSettings)) {
      // Prevent add actions again if you go back and forth between steps
      existingActions = actionsReduce(
        existingActions,
        'modify_token_voting_settings'
      );
      const voteSettingsAction: ActionUpdatePluginSettings = {
        name: 'modify_token_voting_settings',
        inputs: {
          token: daoToken,
          totalVotingWeight: tokenSupply?.raw || BigInt(0),

          minDuration: getSecondsFromDHM(
            durationDays,
            durationHours,
            durationMinutes
          ),
          supportThreshold: Number(minimumApproval) / 100,
          minParticipation: Number(minimumParticipation) / 100,
          minProposerVotingPower:
            eligibilityType === 'token'
              ? parseUnits(
                  eligibilityTokenAmount.toString(),
                  tokenDecimals
                ).toBigInt()
              : undefined,
          votingMode: earlyExecution
            ? VotingMode.EARLY_EXECUTION
            : voteReplacement
            ? VotingMode.VOTE_REPLACEMENT
            : VotingMode.STANDARD,
        },
      };
      settingsAction = voteSettingsAction;
    } else {
      // Prevent add actions again if you go back and forth between steps
      existingActions = actionsReduce(
        existingActions,
        'modify_multisig_voting_settings'
      );
      const multisigSettingsAction: ActionUpdateMultisigPluginSettings = {
        name: 'modify_multisig_voting_settings',
        inputs: {
          minApprovals: multisigMinimumApprovals,
          onlyListed: eligibilityType === 'multisig',
        },
      };
      settingsAction = multisigSettingsAction;
    }
    // Ensure that the add/remove gasless actions are before edit settings actions because it can cause errors when
    // setting de minTallyApproval
    setValue(
      'actions',
      filterActions([...existingActions, metadataAction, settingsAction])
    );
  }, [
    getValues,
    daoDetails,
    pluginSettings,
    daoToken,
    pluginAddress,
    setValue,
    tokenSupply?.raw,
    filterActions,
  ]);

  if (daoDetailsLoading || settingsLoading || tokenSupplyIsLoading) {
    return <Loading />;
  }

  if (!pluginSettings || !daoDetails) {
    return null;
  }

  return (
    <FullScreenStepper
      wizardProcessName={t('newProposal.title')}
      navLabel={t('navLinks.settings')}
      returnPath={generatePath(Settings, {
        network,
        dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
      })}
    >
      <Step
        wizardTitle={t('settings.proposeSettings')}
        wizardDescription={t('settings.proposeSettingsSubtitle')}
        onNextButtonClicked={next => {
          setFormActions();
          next();
        }}
      >
        <CompareSettings />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.defineProposal.heading')}
        wizardDescription={t('newWithdraw.defineProposal.description')}
        isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
      >
        <DefineProposal />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.setupVoting.title')}
        wizardDescription={t('newWithdraw.setupVoting.description')}
      >
        <SetupVotingForm pluginSettings={pluginSettings} />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.reviewProposal.heading')}
        wizardDescription={t('newWithdraw.reviewProposal.description')}
        nextButtonLabel={t('labels.submitProposal')}
        onNextButtonClicked={handlePublishProposalClick}
        fullWidth
      >
        <ReviewProposal defineProposalStepNumber={2} />
        <CreateProposalDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </Step>
    </FullScreenStepper>
  );
};
