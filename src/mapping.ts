import {
  Create,
  CreateOptionsContract,
  Exercise,
  Expire,
} from "../generated/BufferRouter/BufferBinaryOptions";
import { ContractRegistryUpdated } from "../generated/BufferRouter/BufferRouter";
import { OptionContract, Trade } from "../generated/schema";
import {
  _createTradeEntity,
  checkTimeThreshold,
  getPoolNameFromAddress,
  isRegisteredTOABRouter,
  isRegisteredToV2Router,
  registerAmarket,
  updateOrCreateLeaderboards,
} from "./common";

import {
  Create as CreateAB,
  CreateOptionsContract as CreateOptionsContractAB,
  Exercise as ExerciseAB,
  Expire as ExpireAB,
} from "../generated/AboveBelowBufferRouter/AboveBelowBufferBinaryOptions";
import { ContractRegistryUpdated as ContractRegistryUpdatedAB } from "../generated/AboveBelowBufferRouter/AboveBelowBufferRouter";
import { ZERO } from "./config";

// Up - Down
export function handleV2ContractRegistryUpdated(
  event: ContractRegistryUpdated
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleV2CreateOptionsContract(
  event: CreateOptionsContract
): void {
  const market = OptionContract.load(event.address.toHexString().toLowerCase());
  if (isRegisteredToV2Router(event.address) && market != null) {
    market.pool = getPoolNameFromAddress(event.params.pool);
    market.save();
  }
}

export function handleV2Create(event: Create): void {
  if (checkTimeThreshold(event.block.timestamp)) {
    const market = OptionContract.load(
      event.address.toHexString().toLowerCase()
    );

    if (isRegisteredToV2Router(event.address) && market != null) {
      _createTradeEntity(
        event.params.id,
        event.address,
        event.params.account,
        event.params.totalFee,
        event.params.settlementFee,
        market.pool
      );
    }
  }
}

export function handleV2Expire(event: Expire): void {
  if (
    checkTimeThreshold(event.block.timestamp) &&
    isRegisteredToV2Router(event.address)
  ) {
    const trade = Trade.load(
      event.params.id.toString() + event.address.toHexString().toLowerCase()
    );
    if (trade != null) {
      updateOrCreateLeaderboards(
        trade.volume,
        trade.token,
        ZERO.minus(trade.volume),
        event.block.timestamp,
        trade.userAddress.toHexString(),
        false,
        trade.fee
      );
    }
  }
}

export function handleV2Exercise(event: Exercise): void {
  if (
    checkTimeThreshold(event.block.timestamp) &&
    isRegisteredToV2Router(event.address)
  ) {
    const trade = Trade.load(
      event.params.id.toString() + event.address.toHexString().toLowerCase()
    );
    if (trade != null) {
      updateOrCreateLeaderboards(
        trade.volume,
        trade.token,
        event.params.profit.minus(trade.volume),
        event.block.timestamp,
        trade.userAddress.toHexString(),
        true,
        trade.fee
      );
    }
  }
}

// Above - Below
export function handleABContractRegistryUpdated(
  event: ContractRegistryUpdatedAB
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleABCreateOptionsContract(
  event: CreateOptionsContractAB
): void {
  const market = OptionContract.load(event.address.toHexString().toLowerCase());
  if (isRegisteredTOABRouter(event.address) && market != null) {
    market.pool = getPoolNameFromAddress(event.params.pool);
    market.save();
  }
}

export function handleABCreate(event: CreateAB): void {
  if (checkTimeThreshold(event.block.timestamp)) {
    const market = OptionContract.load(
      event.address.toHexString().toLowerCase()
    );

    if (isRegisteredTOABRouter(event.address) && market != null) {
      _createTradeEntity(
        event.params.id,
        event.address,
        event.params.account,
        event.params.totalFee,
        event.params.settlementFee,
        market.pool
      );
    }
  }
}

export function handleABExpire(event: ExpireAB): void {
  if (
    checkTimeThreshold(event.block.timestamp) &&
    isRegisteredTOABRouter(event.address)
  ) {
    const trade = Trade.load(
      event.params.id.toString() + event.address.toHexString().toLowerCase()
    );
    if (trade != null) {
      updateOrCreateLeaderboards(
        trade.volume,
        trade.token,
        ZERO.minus(trade.volume),
        event.block.timestamp,
        trade.userAddress.toHexString(),
        false,
        trade.fee
      );
    }
  }
}

export function handleABExercise(event: ExerciseAB): void {
  if (
    checkTimeThreshold(event.block.timestamp) &&
    isRegisteredTOABRouter(event.address)
  ) {
    const trade = Trade.load(
      event.params.id.toString() + event.address.toHexString().toLowerCase()
    );
    if (trade != null) {
      updateOrCreateLeaderboards(
        trade.volume,
        trade.token,
        event.params.profit.minus(trade.volume),
        event.block.timestamp,
        trade.userAddress.toHexString(),
        true,
        trade.fee
      );
    }
  }
}
