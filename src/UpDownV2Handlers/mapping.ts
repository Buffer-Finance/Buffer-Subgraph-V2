import {
  CancelTrade,
  CancelTrade as CancelTrade_2,
  CancelTrade as CancelTrade_3,
  ContractRegistryUpdated,
  ContractRegistryUpdated as ContractRegistryUpdated_2,
  ContractRegistryUpdated as ContractRegistryUpdated_3,
  OpenTrade,
  OpenTrade as OpenTrade_2,
  OpenTrade as OpenTrade_3,
} from "../../generated/V2_Router_3/V2_Router_3";
import { OptionContract, Trade } from "../../generated/schema";
import {
  Create,
  CreateOptionsContract,
  LpLoss,
  LpProfit,
} from "../../generated/v2_markets/v2_markets";
import {
  _createOrUpdateLeaderBoards,
  _createTradeEntity,
  getPoolNameFromAddress,
  registerAmarket,
} from "../commons";

// V2 Router 1
export function handleV2ContractRegistryUpdated(
  event: ContractRegistryUpdated
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleV2CancelTrade(event: CancelTrade): void {}

export function handleV2OpenTrade(event: OpenTrade): void {}

//V2 Router 2
export function handleV2ContractRegistryUpdated_2(
  event: ContractRegistryUpdated_2
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleV2CancelTrade_2(event: CancelTrade_2): void {}

export function handleV2OpenTrade_2(event: OpenTrade_2): void {}

// V2 Router 3
export function handleV2ContractRegistryUpdated_3(
  event: ContractRegistryUpdated_3
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleV2CancelTrade_3(event: CancelTrade_3): void {}

export function handleV2OpenTrade_3(event: OpenTrade_3): void {}

export function handleV2Create(event: Create): void {
  const market = OptionContract.load(event.address.toHexString().toLowerCase());

  if (market != null) {
    _createTradeEntity(
      event.params.id,
      event.address,
      event.params.account,
      event.params.totalFee,
      market.pool
    );
  }
}

export function handleV2LpProfit(event: LpLoss): void {
  const trade = Trade.load(
    event.params.id.toString() + event.address.toHexString().toLowerCase()
  );
  if (trade != null) {
    _createOrUpdateLeaderBoards(
      event.block.timestamp,
      trade.userAddress,
      trade.volume,
      trade.token,
      event.params.amount,
      false
    );
  }
}

export function handleV2LpLoss(event: LpProfit): void {
  const trade = Trade.load(
    event.params.id.toString() + event.address.toHexString().toLowerCase()
  );
  if (trade != null) {
    _createOrUpdateLeaderBoards(
      event.block.timestamp,
      trade.userAddress,
      trade.volume,
      trade.token,
      event.params.amount,
      true
    );
  }
}

export function handleV2CreateOptionsContract(
  event: CreateOptionsContract
): void {
  const market = OptionContract.load(event.address.toHexString().toLowerCase());
  if (market != null) {
    market.pool = getPoolNameFromAddress(event.params.pool);
    market.poolContract = event.params.pool;
    market.save();
  }
}
