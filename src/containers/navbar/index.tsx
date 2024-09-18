import React, {useEffect, useMemo} from 'react';
import {matchRoutes, useLocation, useNavigate} from 'react-router-dom';

import {ProcessType} from 'containers/exitProcessMenu';
import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA, FEEDBACK_FORM} from 'utils/constants';
import {
  Community,
  CreateDAO,
  Finance,
  Governance,
  Landing,
  ManageMembersProposal,
  MintTokensProposal,
  NewDeposit,
  NewProposal,
  NewWithDraw,
  ProposeNewSettings,
  Settings,
} from 'utils/paths';
import {i18n} from '../../../i18n.config';
import DesktopNav from './desktop';
import MobileNav from './mobile';
import {useWallet} from '../../hooks/useWallet';

const Navbar: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {pathname} = useLocation();
  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  const {data: daoDetails} = useDaoDetailsQuery();
  const navigate = useNavigate();
  const {isConnected} = useWallet();
  const processInfo = useMemo(() => {
    const matches = matchRoutes(processPaths, pathname);
    if (matches) return getProcessInfo(matches[0].route.path) as ProcessInfo;
  }, [pathname]);

  // set current dao as selected dao
  useEffect(() => {
    if (daoDetails) {
      selectedDaoVar({
        address: daoDetails.address,
        ensDomain: daoDetails.ensDomain,
        metadata: {
          name: daoDetails.metadata.name,
          avatar: daoDetails?.metadata?.avatar,
        },
        chain: CHAIN_METADATA[network].id,
        plugins: daoDetails.plugins,
      });
    }
  }, [daoDetails, network]);

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handleOnDaoSelect = () => {
    handleWithFunctionalPreferenceMenu(() => open('selectDao'));
  };

  const handleWalletButtonClick = () => {
    open('wallet');
  };

  // const handleFeedbackButtonClick = () => {
  //   window.open(FEEDBACK_FORM, '_blank');
  // };
  const handleCreateDaoButtonClick = () => {
    // window.open(FEEDBACK_FORM, '_blank');
    if (isConnected) {
      navigate('/create');
      return;
    }
  };

  if (isDesktop) {
    return (
      <DesktopNav
        isProcess={processInfo?.isProcess}
        returnURL={processInfo?.returnURL}
        processLabel={processInfo?.processLabel}
        processType={processInfo?.processType}
        onDaoSelect={handleOnDaoSelect}
        onWalletClick={handleWalletButtonClick}
        onCreateDaoClick={handleCreateDaoButtonClick}
        // onFeedbackClick={handleFeedbackButtonClick}
      />
    );
  }
  return (
    <MobileNav
      onDaoSelect={handleOnDaoSelect}
      onWalletClick={handleWalletButtonClick}
      onCreateDaoClick={handleCreateDaoButtonClick}
      // onFeedbackClick={handleFeedbackButtonClick}
    />
  );
};

export default Navbar;

/* PROCESS ================================================================= */
type StringIndexed = {[key: string]: {processLabel: string; returnURL: string}};

const processPaths = [
  {path: NewDeposit},
  {path: NewWithDraw},
  {path: CreateDAO},
  {path: NewProposal},
  {path: ProposeNewSettings},
  {path: MintTokensProposal},
  {path: ManageMembersProposal},
];

const processes: StringIndexed = {
  [CreateDAO]: {processLabel: i18n.t('createDAO.title'), returnURL: Landing},
  [NewDeposit]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewWithDraw]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewProposal]: {
    processLabel: i18n.t('newProposal.title'),
    returnURL: Governance,
  },
  [ProposeNewSettings]: {
    processLabel: i18n.t('settings.proposeSettings'),
    returnURL: Settings,
  },
  [MintTokensProposal]: {
    processLabel: i18n.t('labels.addMember'),
    returnURL: Community,
  },
  [ManageMembersProposal]: {
    processLabel: i18n.t('labels.manageMember'),
    returnURL: Community,
  },
};

type ProcessInfo = {
  isProcess: boolean;
  processLabel: string | undefined;
  returnURL: string | undefined;
  processType: 'DaoCreation' | 'ProposalCreation' | undefined;
  processName: string | undefined;
};

function getProcessInfo(
  processPath: string | undefined
): ProcessInfo | undefined {
  if (processPath) {
    return {
      isProcess: true,
      ...processes[processPath],
      processName: processPath,
      processType: getExitProcessType(processPath),
    };
  }
}

function getExitProcessType(processPath: string): ProcessType | undefined {
  switch (processPath) {
    case CreateDAO:
      return 'DaoCreation';

    case ManageMembersProposal:
    case MintTokensProposal:
    case NewProposal:
    case NewWithDraw:
    case ProposeNewSettings:
      return 'ProposalCreation';
  }
}
