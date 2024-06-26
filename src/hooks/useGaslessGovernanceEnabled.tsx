import {GaslessPluginName, PluginTypes} from './usePluginClient';
import {useVotingSettings} from '../services/aragon-sdk/queries/use-voting-settings';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import {useDaoDetailsQuery} from './useDaoDetails';
import {useIsMintable} from 'services/aragon-sdk/queries/use-is-mintable';

export const useGaslessGovernanceEnabled = () => {
  const {data: daoDetails} = useDaoDetailsQuery();

  const pluginAddress = daoDetails?.plugins[0].instanceAddress;
  const pluginType = daoDetails?.plugins[0].id as PluginTypes;

  const {data: votingSettings} = useVotingSettings({
    pluginAddress,
    pluginType,
  });

  const {data: isMintable} = useIsMintable({
    pluginType,
    daoAddress: daoDetails?.address || '',
  });

  // If is not gasless, return true
  // If is loading should return false, to avoid to "wrapped tokens" workflows before know if the token is wrapped or not
  // Then, return the value of hasGovernanceEnabled
  const isGovernanceEnabled =
    pluginType === GaslessPluginName
      ? !!(votingSettings as GaslessPluginVotingSettings)
          ?.hasGovernanceEnabled && !!isMintable
      : true;
  return {isGovernanceEnabled};
};
