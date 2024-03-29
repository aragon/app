import {Button, IconType, Spinner, Tag} from '@aragon/ods';
import {AvatarDao} from '@aragon/ods-old';
import {SessionTypes} from '@walletconnect/types';
import React, {useCallback} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import {useActionsContext} from 'context/actions';
import {useNetwork} from 'context/network';
import useScreen from 'hooks/useScreen';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {addABI, decodeMethod} from 'utils/abiDecoder';
import {attachEtherNotice} from 'utils/contract';
import {
  getEncodedActionInputs,
  getWCEncodedFunctionName,
  getWCNativeToField,
  parseWCIconUrl,
} from 'utils/library';
import {useWalletConnectContext} from '../walletConnectProvider';

type Props = {
  onBackButtonClicked: () => void;
  onClose: () => void;
  isOpen: boolean;
  selectedSession: SessionTypes.Struct;
  actionIndex: number;
};

const ActionListenerModal: React.FC<Props> = ({
  onBackButtonClicked,
  onClose,
  actionIndex,
  selectedSession,
  isOpen,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {isDesktop} = useScreen();

  const {setValue} = useFormContext();
  const {addAction, removeAction} = useActionsContext();

  const {actions: actionsReceived} = useWalletConnectContext();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddActions = useCallback(async () => {
    // Make sure that the current modal action has some value set on the form
    // to delete the correct action when calling deleteAction at the end
    setValue(`actions.${actionIndex}.name`, 'wallet_connect_modal');

    // NOTE: this is slightly inefficient and can be optimized
    // by wrapping the map in a Promise.all, but there might be an
    // even better solution. I am unsure if the getEtherscanVerifiedContract
    // will always be ran with the same parameters given each batch of actions
    // will be coming from only one dApp at a time. If that is indeed
    // the case, then both the Etherscan data and notices can be fetched
    // and parsed outside of the loop, getting rid of the unnecessary
    // async requests. F.F. - [07-10-2023]
    for (const {action, index: currentIndex} of actionsReceived.map(
      (action, index) => ({
        action,
        index,
      })
    )) {
      // verify and decode
      const etherscanData = await getEtherscanVerifiedContract(
        action.params[0].to,
        network
      );

      // increment the index so multiple actions can be added at once
      const index = actionIndex + (currentIndex + 1);

      // name, raw action and contract address set on every action
      addAction({name: 'wallet_connect_action'});
      setValue(`actions.${index}.name`, 'wallet_connect_action');
      setValue(`actions.${index}.raw`, action.params[0]);
      setValue(`actions.${index}.contractAddress`, action.params[0].to);

      // fill out the wallet connect action based on verification/encoded status
      if (
        etherscanData.status === '1' &&
        etherscanData.result[0].ABI !== 'Contract source code not verified'
      ) {
        setValue(`actions.${index}.verified`, true);

        addABI(JSON.parse(etherscanData.result[0].ABI));
        const decodedData = decodeMethod(action.params[0].data);

        if (decodedData) {
          //verified & decoded, use decoded params
          setValue(`actions.${index}.decoded`, true);
          setValue(
            `actions.${index}.contractName`,
            etherscanData.result[0].ContractName
          );
          setValue(`actions.${index}.functionName`, decodedData.name);

          // get notices using etherscan abi parser
          const notices = attachEtherNotice(
            etherscanData.result[0].SourceCode,
            etherscanData.result[0].ContractName,
            JSON.parse(etherscanData.result[0].ABI)
          ).find(notice => notice.name === decodedData.name);

          // attach notice to input
          const inputs = decodedData.params.map(param => {
            return {
              ...param,
              notice: notices?.inputs.find(
                notice =>
                  notice.name === param.name && notice.type === param.type
              )?.notice,
            };
          });

          // add payable field as it is NOT present on the method itself
          if (action.params[0].value) {
            inputs.push(getWCNativeToField(t, action.params[0].value, network));
          }
          setValue(`actions.${index}.inputs`, [...inputs]);
          setValue(`actions.${actionIndex}.notice`, notices?.notice);
        } else {
          // Verified but failed to decode
          setValue(`actions.${index}.decoded`, false);
          setValue(
            `actions.${index}.contractName`,
            etherscanData.result[0].ContractName
          );

          setValue(
            `actions.${index}.functionName`,
            getWCEncodedFunctionName(action.method)
          );
          setValue(
            `actions.${index}.inputs`,
            getEncodedActionInputs(action.params[0], network, t)
          );
        }
      } else {
        // unverified & encoded
        setValue(`actions.${index}.decoded`, false);
        setValue(`actions.${index}.verified`, false);
        setValue(`actions.${index}.contractName`, action.params[0].to);
        setValue(
          `actions.${index}.functionName`,
          getWCEncodedFunctionName(action.method)
        );

        setValue(
          `actions.${index}.inputs`,
          getEncodedActionInputs(action.params[0], network, t)
        );
      }
    }

    removeAction(actionIndex);
  }, [
    actionIndex,
    actionsReceived,
    addAction,
    network,
    removeAction,
    setValue,
    t,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (!isOpen) {
    return null;
  }

  const atLeastOneActionReceived = actionsReceived.length > 0;
  const noActionsReceived = !atLeastOneActionReceived;
  const metadataName = selectedSession.peer.metadata.name;
  const metadataURL = selectedSession.peer.metadata.url;
  const metadataIcon = parseWCIconUrl(
    metadataURL,
    selectedSession.peer.metadata.icons[0]
  );

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={metadataName}
        showBackButton
        onBackButtonClicked={onBackButtonClicked}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <div className="flex flex-col items-center space-y-3">
          <AvatarDao
            daoName={metadataName}
            src={metadataIcon}
            size="unset"
            className="size-[50px] border border-neutral-100 bg-neutral-50"
          />
          <div className="flex items-center justify-center gap-x-2 ft-text-base">
            <Spinner size="sm" />
            <p className="text-center font-semibold text-neutral-800">
              {t('modal.dappConnect.detaildApp.spinnerLabel')}
            </p>
          </div>
          <p className="text-center text-sm leading-normal text-neutral-500 xl:px-10">
            {t('modal.dappConnect.detaildApp.desc', {
              dappName: metadataName,
            })}
          </p>
          {atLeastOneActionReceived && (
            <Tag
              label={t('modal.dappConnect.detaildApp.amountActionsTag', {
                amountActions: actionsReceived.length,
              })}
            />
          )}

          {noActionsReceived && (
            <Tag label={t('modal.dappConnect.detaildApp.noActionsTag')} />
          )}
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            {atLeastOneActionReceived && (
              <Button
                onClick={handleAddActions}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {t('modal.dappConnect.detaildApp.ctaLabel', {
                  amountActions: actionsReceived.length,
                })}
              </Button>
            )}

            {metadataURL && (
              <Button
                href={metadataURL}
                target="_blank"
                variant="secondary"
                size="lg"
                className="w-full"
                iconRight={IconType.LINK_EXTERNAL}
              >
                {t('modal.dappConnect.ctaOpenDapp', {
                  dappName: metadataName,
                })}
              </Button>
            )}
          </div>

          {noActionsReceived && (
            <Button
              href={t('modal.dappConnect.ctaGuideURL')}
              target="_blank"
              variant="tertiary"
              size="lg"
              className="w-full"
              iconRight={IconType.LINK_EXTERNAL}
            >
              {t('modal.dappConnect.ctaGuide')}
            </Button>
          )}
        </div>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default ActionListenerModal;

const Content = styled.div.attrs({
  className: 'py-6 px-4 xl:px-6 space-y-6',
})``;
