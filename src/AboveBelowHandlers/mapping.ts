import {
  Create,
  Exercise,
  Expire,
} from "../../generated/ab_markets/ab_markets";
import {
  CancelTrade,
  ContractRegistryUpdated,
  InitiateTrade,
  OpenTrade,
} from "../../generated/ab_router/ab_router";
import {
  CancelTrade as CancelTrade_2,
  ContractRegistryUpdated as ContractRegistryUpdated_2,
  InitiateTrade as InitiateTrade_2,
  OpenTrade as OpenTrade_2,
} from "../../generated/ab_router_2/ab_router_2";
import { OptionContract, Trade } from "../../generated/schema";
import {
  _createOrUpdateLeaderBoards,
  _createTradeEntity,
  registerAmarket,
} from "../commons";

// ab Router 1

export function handleABContractRegistryUpdated(
  event: ContractRegistryUpdated
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleABCancelTrade(event: CancelTrade): void {}

export function handleABOpenTrade(event: OpenTrade): void {}

export function handleABInitiateTrade(event: InitiateTrade): void {}

//ab Router 2

export function handleABContractRegistryUpdated_2(
  event: ContractRegistryUpdated_2
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleABCancelTrade_2(event: CancelTrade_2): void {}

export function handleABOpenTrade_2(event: OpenTrade_2): void {}

export function handleABInitiateTrade_2(event: InitiateTrade_2): void {}

export function handleABCreate(event: Create): void {
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

export function handleABExercise(event: Exercise): void {
  const trade = Trade.load(
    event.params.id.toString() + event.address.toHexString().toLowerCase()
  );
  if (trade != null) {
    _createOrUpdateLeaderBoards(
      event.block.timestamp,
      trade.userAddress,
      trade.volume,
      trade.token,
      event.params.profit,
      true
    );
  }
}

export function handleABExpire(event: Expire): void {
  const trade = Trade.load(
    event.params.id.toString() + event.address.toHexString().toLowerCase()
  );
  if (trade != null) {
    _createOrUpdateLeaderBoards(
      event.block.timestamp,
      trade.userAddress,
      trade.volume,
      trade.token,
      trade.volume,
      false
    );
  }
}
