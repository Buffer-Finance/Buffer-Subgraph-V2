import { Address } from "@graphprotocol/graph-ts";
import {
  BufferBinaryOptions,
  Create,
  CreateOptionsContract,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { RouterAddress, State } from "./config";
import { _loadOrCreateConfigContractEntity } from "./configContractHandlers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
} from "./initialize";

export function _handleCreateContract(event: CreateOptionsContract): void {
  const contractAddress = event.address;
  const contractAddressString = contractAddress.toHexString();
  const routerContract = BufferRouter.bind(Address.fromString(RouterAddress));

  if (
    routerContract.try_contractRegistry(contractAddress).reverted === false &&
    routerContract.try_contractRegistry(contractAddress).value === true
  ) {
    const optionContract = _loadOrCreateOptionContractEntity(
      contractAddressString
    );
    const configContractEntity = _loadOrCreateConfigContractEntity(
      event.params.config.toHexString()
    );
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);

    optionContract.token0 = event.params.token0;
    optionContract.token1 = event.params.token1;
    optionContract.config = configContractEntity.id;
    optionContract.poolContract = optionContractInstance.pool();
    optionContract.routerContract = Address.fromHexString(RouterAddress);
    optionContract.save();
  }
}

export function _handleCreate(event: Create): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));

  if (
    routerContract.try_contractRegistry(contractAddress).reverted === false &&
    routerContract.try_contractRegistry(contractAddress).value === true
  ) {
    let optionID = event.params.id;
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
    let optionData = optionContractInstance.options(optionID);
    let userOptionData = _loadOrCreateOptionDataEntity(
      optionID,
      contractAddressString
    );
    userOptionData.user = event.params.account;
    userOptionData.totalFee = event.params.totalFee;
    userOptionData.state = optionData.value0;
    userOptionData.strike = optionData.value1;
    userOptionData.amount = optionData.value5;
    userOptionData.expirationTime = optionData.value2;
    userOptionData.isAbove = optionData.value4;
    userOptionData.creationTime = optionData.value3;
    userOptionData.settlementFee = event.params.settlementFee;
    userOptionData.save();

    // const market = _loadOrCreateMarket(event.params.marketId);
    // if (market.skew !== event.params.skew) {
    //   market.skew = event.params.skew;
    //   market.save();
    // }

    // updateOpeningStats(
    //   event.block.timestamp,
    //   contractAddress.toHexString(),
    //   userOptionData.totalFee,
    //   userOptionData.settlementFee,
    //   userOptionData.isAbove
    // );
  }
}

export function _handleExpire(event: Expire): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();

  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.try_contractRegistry(contractAddress).reverted === false &&
    routerContract.try_contractRegistry(contractAddress).value === true
  ) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddressString
    );
    userOptionData.state = State.expired;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    // updateClosingStats(
    //   contractAddressString,
    //   userOptionData.totalFee,
    //   userOptionData.isAbove
    // );
  }
}

export function _handleExercise(event: Exercise): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();

  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.try_contractRegistry(contractAddress).reverted === false &&
    routerContract.try_contractRegistry(contractAddress).value === true
  ) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddressString
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    // updateClosingStats(
    //   contractAddressString,
    //   userOptionData.totalFee,
    //   userOptionData.isAbove
    // );
  }
}

export function _handlePause(event: Pause): void {
  let optionContract = _loadOrCreateOptionContractEntity(
    event.address.toHexString()
  );

  optionContract.isPaused = event.params.isPaused;
  optionContract.save();
}

// export function _handleCreateMarket(event: CreateMarket): void {
//   const optionContract = _loadOrCreateOptionContractEntity(
//     event.params.optionsContract.toHexString()
//   );
//   const market = _loadOrCreateMarket(event.params.marketId);
//   market.optionContract = optionContract.id;
//   market.strike = event.params.strike;
//   market.expiration = event.params.expiration;
//   market.save();
// }
