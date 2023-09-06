import {IconLinkExternal, Link} from '@aragon/ods';
import {MultisigVotingSettings} from '@aragon/sdk-client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {
  Definition,
  DescriptionPair,
  SettingsCard,
  Term,
} from 'containers/settingsCard';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'hooks/useVotingSettings';
import {IPluginSettings} from 'pages/settings';
import {Community} from 'utils/paths';

const MultisigSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network} = useNetwork(); // TODO get the network from daoDetails
  const navigate = useNavigate();

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const {data: votingSettings} = useVotingSettings({pluginAddress, pluginType});
  const {data: daoMembers} = useDaoMembers(pluginAddress, pluginType);

  const daoSettings = votingSettings as MultisigVotingSettings;

  return (
    <>
      {/* COMMUNITY SECTION */}
      <SettingsCard title={t('navLinks.community')}>
        <DescriptionPair>
          <Term>{t('labels.review.eligibleVoters')}</Term>
          <Definition>{t('createDAO.step3.multisigMembers')}</Definition>
        </DescriptionPair>

        <DescriptionPair className="border-none">
          <Term>{t('labels.members')}</Term>
          <Definition>
            <Link
              label={t('createDAO.review.distributionLink', {
                count: daoMembers?.members?.length,
              })}
              iconRight={<IconLinkExternal />}
              onClick={() =>
                navigate(
                  generatePath(Community, {network, dao: daoDetails?.address})
                )
              }
            />
          </Definition>
        </DescriptionPair>
      </SettingsCard>

      {/* GOVERNANCE SECTION */}
      <SettingsCard title={t('labels.review.governance')}>
        <DescriptionPair>
          <Term>{t('labels.minimumApproval')}</Term>
          <Definition>{`${daoSettings?.minApprovals} of ${
            daoMembers?.members.length
          } ${t('labels.authorisedWallets')}`}</Definition>
        </DescriptionPair>

        <DescriptionPair className="border-none">
          <Term>{t('labels.proposalCreation')}</Term>
          <Definition>
            {daoSettings?.onlyListed
              ? t('createDAO.step3.multisigMembers')
              : t('createDAO.step3.eligibility.anyWallet.title')}
          </Definition>
        </DescriptionPair>
      </SettingsCard>
    </>
  );
};

export default MultisigSettings;
