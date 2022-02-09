import {GovernanceWrappedERC20} from '../../generated/templates/DaoTemplate/GovernanceWrappedERC20';
import {
  ERC20Token,
  Balance,
  DaoGovernance,
  Governance
} from '../../generated/schema';
import {Address, BigInt, store} from '@graphprotocol/graph-ts';
import {ADDRESS_ZERO} from '../utils/constants';

export function updateBalance(
  balanceId: string,
  daoAddress: Address,
  token: Address,
  amount: BigInt,
  isDeposit: boolean,
  timestamp: BigInt
): void {
  let daoId = daoAddress.toHexString();
  let entity = Balance.load(balanceId);

  if (!entity) {
    entity = new Balance(balanceId);
    entity.token = token.toHexString();
    entity.dao = daoId;
  }

  if (token.toHexString() == ADDRESS_ZERO) {
    // ETH
    entity.balance = isDeposit
      ? entity.balance.plus(amount)
      : entity.balance.minus(amount);
  } else {
    // ERC20 token
    let tokenContract = GovernanceWrappedERC20.bind(token);
    let daoBalance = tokenContract.try_balanceOf(daoAddress);
    if (!daoBalance.reverted) {
      entity.balance = daoBalance.value;
    }
  }

  entity.lastUpdated = timestamp;
  entity.save();
}

export function handleERC20Token(token: Address): void {
  let entity = ERC20Token.load(token.toHexString());
  if (!entity) {
    entity = new ERC20Token(token.toHexString());

    if (token.toHexString() == ADDRESS_ZERO) {
      entity.name = 'Ethereum (Canonical)';
      entity.symbol = 'ETH';
      entity.decimals = BigInt.fromString('18');
      entity.save();
      return;
    }

    let tokenContract = GovernanceWrappedERC20.bind(token);
    let tokenName = tokenContract.try_name();
    let tokenSymbol = tokenContract.try_symbol();
    let tokenDecimals = tokenContract.try_decimals();

    if (
      !tokenName.reverted &&
      !tokenSymbol.reverted &&
      !tokenDecimals.reverted
    ) {
      entity.name = tokenName.value;
      entity.symbol = tokenSymbol.value;
      entity.decimals = BigInt.fromString(tokenDecimals.value.toString());
    }

    entity.save();
  }
}

export function addGovernance(daoId: string, who: string): void {
  let daoGovernanceEntityId = daoId + '_' + who;
  let daoGovernanceEntity = new DaoGovernance(daoGovernanceEntityId);
  daoGovernanceEntity.governance = who;
  daoGovernanceEntity.dao = daoId;
  daoGovernanceEntity.save();

  // governance
  let governanceEntity = Governance.load(who);
  if (!governanceEntity) {
    governanceEntity = new Governance(who);
    governanceEntity.save();
  }
}

export function removeGovernance(daoId: string, who: string): void {
  let daoGovernanceEntityId = daoId + '_' + who;
  let daoGovernanceEntity = DaoGovernance.load(daoGovernanceEntityId);
  if (daoGovernanceEntity) {
    store.remove('DaoGovernance', daoGovernanceEntityId);
  }
}
