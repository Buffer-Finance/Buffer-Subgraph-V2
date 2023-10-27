import {
  BufferBinaryOptions,
  Create,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { UserOptionData } from "../generated/schema";
import { updateClosingStats } from "./aggregate";
import { State } from "./config";
import { updateOptionContractData } from "./core";
import { isContractRegisteredToRouter } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
} from "./initialize";

export function _handleCreate(event: Create): void {
  let contractAddress = event.address;
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);
  const tournamentId = event.params.tournamentId;

  if (isContractRegisteredToRouter(optionContractInstance) === true) {
    let optionID = event.params.id;
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
    let optionData = optionContractInstance.options(optionID);
    let isAbove = optionData.value6 ? true : false;
    let totalFee = event.params.totalFee;
    updateOptionContractData(true, isAbove, totalFee, contractAddress);

    let userOptionData = _loadOrCreateOptionDataEntity(
      optionID,
      contractAddress,
      tournamentId
    );
    userOptionData.user = event.params.account;
    userOptionData.totalFee = totalFee;
    userOptionData.state = optionData.value0;
    userOptionData.strike = optionData.value1;
    userOptionData.amount = optionData.value2;
    userOptionData.expirationTime = optionData.value5;
    userOptionData.isAbove = isAbove;
    userOptionData.creationTime = optionData.value8;
    userOptionData.settlementFee = event.params.settlementFee;
    // userOptionData.depositToken = tokenReferrenceID;
    // userOptionData.poolToken = poolToken;
    userOptionData.save();

    // updateOpeningStats(
    //   userOptionData.depositToken,
    //   event.block.timestamp,
    //   totalFee,
    //   userOptionData.settlementFee,
    //   isAbove,
    //   contractAddress,
    //   userOptionData.poolToken
    // );
  }
}

export function _handleExpire(event: Expire): void {
  let contractAddress = event.address;
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  // check if option contract is registered to our router
  if (isContractRegisteredToRouter(optionContractInstance) === true) {
    let referrenceID = `${event.params.id}${contractAddress}`;
    let userOptionData = UserOptionData.load(referrenceID);
    if (userOptionData != null) {
      userOptionData.state = State.expired;
      userOptionData.expirationPrice = event.params.priceAtExpiration;
      userOptionData.save();

      updateClosingStats(
        userOptionData.totalFee,
        userOptionData.isAbove,
        contractAddress
      );
    }
  }
}

export function _handleExercise(event: Exercise): void {
  let contractAddress = event.address;
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  // check if option contract is registered to our router
  if (isContractRegisteredToRouter(optionContractInstance) === true) {
    let referrenceID = `${event.params.id}${contractAddress}`;
    let userOptionData = UserOptionData.load(referrenceID);
    if (userOptionData != null) {
      userOptionData.state = State.exercised;
      userOptionData.payout = event.params.profit;
      userOptionData.expirationPrice = event.params.priceAtExpiration;
      userOptionData.save();

      updateClosingStats(
        userOptionData.totalFee,
        userOptionData.isAbove,
        contractAddress
      );
    }
  }
}

export function _handlePause(event: Pause): void {
  const optionContractInstance = _loadOrCreateOptionContractEntity(
    event.address
  );

  // check if option contract is registered to our router
  if (isContractRegisteredToRouter(optionContractInstance) === true) {
    let isPaused = event.params.isPaused;
    let optionContract = _loadOrCreateOptionContractEntity(event.address);
    optionContract.isPaused = isPaused;
    optionContract.save();
  }
}
