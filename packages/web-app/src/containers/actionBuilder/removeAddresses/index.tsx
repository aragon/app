import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {useFormContext, useWatch, useFieldArray} from 'react-hook-form';

import EmptyState from '../addAddresses/emptyState';
import {FormItem} from '../addAddresses';
import {AddressRow} from '../addAddresses/addressRow';
import {useDaoParam} from 'hooks/useDaoParam';
import AccordionSummary from '../addAddresses/accordionSummary';
import {useDaoWhitelist} from 'hooks/useDaoMembers';
import {AccordionMethod} from 'components/accordionMethod';
import ManageWalletsModal from 'containers/manageWalletsModal';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';

type Props = {
  index: number;
};

const RemoveAddresses: React.FC<Props> = ({index: actionIndex}) => {
  const {t} = useTranslation();

  const {removeAction} = useActionsContext();

  // dao data
  const {data: dao} = useDaoParam();
  const {data: members} = useDaoWhitelist(dao);

  // form context data & hooks
  const {control} = useFormContext();
  const membersListKey = `actions.${actionIndex}.inputs.memberWallets`;
  const {fields, replace, remove} = useFieldArray({
    control,
    name: membersListKey,
  });

  const memberWallets = useWatch({name: membersListKey, control});
  const controlledWallets = fields.map((field, ctrlledIndex) => {
    return {
      ...field,
      ...(memberWallets && {...memberWallets[ctrlledIndex]}),
    };
  });

  // modal state
  const {open} = useGlobalModalContext();
  const [selectedWallets, setSelectedWallets] = useState<
    Record<string, boolean>
  >(() => {
    const temp = {} as Record<string, boolean>;

    controlledWallets.forEach(({address}) => {
      temp[address] = true;
    });
    return temp;
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  // Modal Handlers
  // handles select all checkbox
  const handleSelectAll = () => {
    const tempSelectedWallets = {...selectedWallets};
    members.forEach(member => {
      tempSelectedWallets[member.id] = true;
    });
    setSelectedWallets(tempSelectedWallets);
  };

  // handles checkbox selection for individual wallets
  const handleSelectWallet = (wallet: string) => {
    const tempSelectedWallets = {...selectedWallets};
    tempSelectedWallets[wallet]
      ? delete tempSelectedWallets[wallet]
      : (tempSelectedWallets[wallet] = true);
    setSelectedWallets(tempSelectedWallets);
  };

  // handles modal Select wallets button
  const handleAddSelectedWallets = (wallets: Array<string>) => {
    replace(wallets.map(address => ({address})));
  };

  // Action Handlers
  function handleRowDelete(rowIndex: number) {
    remove(rowIndex);
  }

  function handleDeleteAll() {
    replace([]);
  }

  const rowActions = [
    {
      component: (
        <ListItemAction
          title={t('labels.whitelistWallets.deleteEntry')}
          bgWhite
        />
      ),
      callback: (rowIndex: number) => {
        handleRowDelete(rowIndex);
      },
    },
  ];

  const methodActions = [
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => {
        removeAction(actionIndex);
      },
    },
  ];

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <>
      <AccordionMethod
        verified
        type="action-builder"
        methodName={t('labels.removeWallets')}
        smartContractName={t('labels.aragonCore')}
        methodDescription={t('labels.removeWalletsDescription')}
        dropdownItems={methodActions}
      >
        {!memberWallets || memberWallets.length === 0 ? (
          <EmptyState
            title={t('labels.whitelistWallets.noWallets')}
            subtitle={t('labels.whitelistWallets.removeWalletsSubtitle')}
            buttonLabel={t('labels.selectWallet')}
            onClick={() => open('manageWallet')}
          />
        ) : (
          <>
            <FormItem className="hidden desktop:block py-1.5">
              <Label label={t('labels.whitelistWallets.address')} />
            </FormItem>
            {controlledWallets.map((field, fieldIndex) => (
              <FormItem key={field.id}>
                <div className="desktop:hidden mb-0.5 desktop:mb-0">
                  <Label label={t('labels.whitelistWallets.address')} />
                </div>
                <AddressRow
                  disabled
                  key={field.id}
                  actionIndex={actionIndex}
                  fieldIndex={fieldIndex}
                  dropdownItems={rowActions}
                />
              </FormItem>
            ))}
            <FormItem className="flex justify-between">
              <ButtonText
                label={t('labels.selectWallet')}
                mode="secondary"
                size="large"
                bgWhite
                onClick={() => open('manageWallet')}
              />

              <Dropdown
                side="bottom"
                align="start"
                sideOffset={4}
                trigger={
                  <ButtonIcon
                    size="large"
                    mode="secondary"
                    icon={<IconMenuVertical />}
                    data-testid="trigger"
                    bgWhite
                  />
                }
                listItems={[
                  {
                    component: (
                      <ListItemAction
                        title={t('labels.whitelistWallets.deleteAllEntries')}
                        bgWhite
                      />
                    ),
                    callback: handleDeleteAll,
                  },
                  {
                    component: (
                      <ListItemAction
                        title={t('labels.whitelistWallets.uploadCSV')}
                        bgWhite
                        mode="disabled"
                      />
                    ),
                    callback: () => {},
                  },
                ]}
              />
            </FormItem>
            <AccordionSummary total={controlledWallets.length} />
          </>
        )}

        <ManageWalletsModal
          addWalletCallback={handleAddSelectedWallets}
          wallets={members?.map(member => member.id) || []}
          selectedWallets={selectedWallets}
          handleSelectWallet={handleSelectWallet}
          handleSelectAll={handleSelectAll}
        />
      </AccordionMethod>
    </>
  );
};

export default RemoveAddresses;
