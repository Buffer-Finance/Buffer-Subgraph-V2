import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  AboveBelowBufferBinaryOptions,
  Create as CreateAB,
} from "../generated/AboveBelowBufferBinaryOptions/AboveBelowBufferBinaryOptions";
import {
  BufferBinaryOptions,
  Create,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  Exercise as ExerciseV1,
  Expire as ExpireV1,
  V1Options,
} from "../generated/V1Options/V1Options";
import { OptionContract } from "../generated/schema";

import {
  AboveBelow_RouterAddress,
  AboveBelow_RouterAddress_2,
  RouterAddress,
  State,
  V2_RouterAddress,
  V2_RouterAddress_2,
  V2_RouterAddress_3,
} from "./config";
import { convertARBToUSDC, convertBFRToUSDC } from "./convertToUSDC";
import { updateOptionContractData } from "./core";
import {
  _loadOrCreateAboveBelowOptionDataEntity,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
} from "./initialize";

export function isContractRegisteredToRouter(
  optionContractInstance: OptionContract
): boolean {
  return optionContractInstance.routerContract == RouterAddress;
}

export function isContractRegisteredToV2Router(
  optionContractInstance: OptionContract
): boolean {
  return (
    optionContractInstance.routerContract == V2_RouterAddress ||
    optionContractInstance.routerContract == V2_RouterAddress_2 ||
    optionContractInstance.routerContract == V2_RouterAddress_3
  );
}

export function isContractRegisteredToAboveBelowRouter(
  optionContractInstance: OptionContract
): boolean {
  return optionContractInstance.routerContract == AboveBelow_RouterAddress;
}

export function isContractRegisteredToAboveBelowV2Router(
  optionContractInstance: OptionContract
): boolean {
  return optionContractInstance.routerContract == AboveBelow_RouterAddress_2;
}

function findPoolAndTokenReferranceID(poolToken: string): string[] {
  let poolReferrenceID: string;
  let tokenReferrenceID: string;

  if (poolToken == "USDC_POL") {
    tokenReferrenceID = "USDC";
    poolReferrenceID = "USDC_POL";
  } else if (poolToken == "ARB") {
    tokenReferrenceID = "ARB";
    poolReferrenceID = "ARB";
  } else if (poolToken == "USDC") {
    tokenReferrenceID = "USDC";
    poolReferrenceID = "USDC";
  } else if (poolToken == "BFR") {
    tokenReferrenceID = "BFR";
    poolReferrenceID = "BFR";
  } else if (poolToken == "V2_USDC") {
    tokenReferrenceID = "USDC";
    poolReferrenceID = "USDC";
  } else if (poolToken == "V2_ARB") {
    tokenReferrenceID = "ARB";
    poolReferrenceID = "ARB";
  } else {
    tokenReferrenceID = "";
    poolReferrenceID = "";
  }

  return [poolReferrenceID, tokenReferrenceID];
}

// Create - Above-Below
export function _handleCreateAB(event: CreateAB): void {
  const contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  if (
    isContractRegisteredToAboveBelowRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowV2Router(optionContractInstance)
  ) {
    let optionID = event.params.id;
    let optionContractInstance = AboveBelowBufferBinaryOptions.bind(
      event.address
    );
    let optionData = optionContractInstance.options(optionID);
    let userOptionData = _loadOrCreateAboveBelowOptionDataEntity(
      optionID,
      contractAddress
    );
    const totalFee = event.params.totalFee;
    let poolToken = updateOptionContractData(true, totalFee, contractAddress);
    const poolTokenReferranceID = findPoolAndTokenReferranceID(poolToken);
    const poolReferrenceID = poolTokenReferranceID[0];
    const tokenReferrenceID = poolTokenReferranceID[1];

    userOptionData.user = event.params.account;
    userOptionData.totalFee = totalFee;
    userOptionData.totalFee_usd = convertToUSD(totalFee, tokenReferrenceID);

    userOptionData.state = optionData.value0;
    userOptionData.strike = optionData.value1;
    userOptionData.amount = optionData.value2;
    userOptionData.expirationTime = optionData.value5;
    userOptionData.isAbove = optionData.value8;
    userOptionData.creationTime = optionData.value7;
    userOptionData.settlementFee = event.params.settlementFee;
    userOptionData.depositToken = tokenReferrenceID;
    userOptionData.poolToken = poolReferrenceID;
    userOptionData.save();
  }
}

// Create - V1, V2
export function _handleCreate(event: Create): void {
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  //v2
  if (isContractRegisteredToV2Router(optionContractInstance)) {
    let optionID = event.params.id;
    let optionContractInstance = BufferBinaryOptions.bind(event.address);
    let optionData = optionContractInstance.options(optionID);
    let totalFee = event.params.totalFee;
    let poolToken = updateOptionContractData(true, totalFee, contractAddress);
    let tokenReferrenceID = "";
    let poolReferrenceID = "";
    if (poolToken == "USDC_POL") {
      tokenReferrenceID = "USDC";
      poolReferrenceID = "USDC_POL";
    } else if (poolToken == "ARB") {
      tokenReferrenceID = "ARB";
      poolReferrenceID = "ARB";
    } else if (poolToken == "USDC") {
      tokenReferrenceID = "USDC";
      poolReferrenceID = "USDC";
    } else if (poolToken == "BFR") {
      tokenReferrenceID = "BFR";
      poolReferrenceID = "BFR";
    } else if (poolToken == "V2_USDC") {
      tokenReferrenceID = "USDC";
      poolReferrenceID = "USDC";
    } else if (poolToken == "V2_ARB") {
      tokenReferrenceID = "ARB";
      poolReferrenceID = "ARB";
    }
    let userOptionData = _loadOrCreateOptionDataEntity(
      optionID,
      contractAddress
    );
    userOptionData.user = event.params.account;
    userOptionData.totalFee = totalFee;
    userOptionData.totalFee_usd = convertToUSD(totalFee, tokenReferrenceID);
    userOptionData.state = optionData.value0;
    userOptionData.strike = optionData.value1;
    userOptionData.amount = optionData.value2;
    userOptionData.expirationTime = optionData.value5;
    userOptionData.creationTime = optionData.value7;
    userOptionData.settlementFee = event.params.settlementFee;
    userOptionData.depositToken = tokenReferrenceID;
    userOptionData.poolToken = poolReferrenceID;
    userOptionData.creationEventTimeStamp = event.block.timestamp;
    userOptionData.lag = userOptionData.creationEventTimeStamp.minus(
      userOptionData.creationTime
    );
    userOptionData.save();
  }

  //v1
  if (isContractRegisteredToRouter(optionContractInstance)) {
    let optionID = event.params.id;
    let optionContractInstance = V1Options.bind(event.address);
    let optionData = optionContractInstance.options(optionID);
    let totalFee = event.params.totalFee;
    let poolToken = updateOptionContractData(true, totalFee, contractAddress);
    let tokenReferrenceID = "";
    if (poolToken == "USDC_POL") {
      tokenReferrenceID = "USDC";
    } else if (poolToken == "ARB") {
      tokenReferrenceID = "ARB";
    } else if (poolToken == "USDC") {
      tokenReferrenceID = "USDC";
    } else if (poolToken == "BFR") {
      tokenReferrenceID = "BFR";
    }
    let userOptionData = _loadOrCreateOptionDataEntity(
      optionID,
      contractAddress
    );
    userOptionData.user = event.params.account;
    userOptionData.totalFee = totalFee;
    userOptionData.totalFee_usd = convertToUSD(totalFee, tokenReferrenceID);
    userOptionData.state = optionData.value0;
    userOptionData.strike = optionData.value1;
    userOptionData.amount = optionData.value2;
    userOptionData.expirationTime = optionData.value5;
    userOptionData.isAbove = optionData.value6;
    userOptionData.creationTime = optionData.value8;
    userOptionData.settlementFee = event.params.settlementFee;
    userOptionData.depositToken = tokenReferrenceID;
    userOptionData.poolToken = poolToken;
    userOptionData.creationEventTimeStamp = event.block.timestamp;
    userOptionData.lag = userOptionData.creationEventTimeStamp.minus(
      userOptionData.creationTime
    );
    userOptionData.save();
  }
}

// Expire - Above-Below,V2
export function _handleExpire(event: Expire): void {
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  //above-below
  if (
    isContractRegisteredToAboveBelowRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowV2Router(optionContractInstance)
  ) {
    let userOptionData = _loadOrCreateAboveBelowOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.expired;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();
  }
  // v2
  else {
    if (isContractRegisteredToV2Router(optionContractInstance)) {
      let userOptionData = _loadOrCreateOptionDataEntity(
        event.params.id,
        contractAddress
      );
      userOptionData.state = State.expired;
      userOptionData.expirationPrice = event.params.priceAtExpiration;
      userOptionData.closeTime = event.block.timestamp;
      userOptionData.isAbove = event.params.isAbove;
      userOptionData.save();
    }
  }
}

// Excercise - Above-Below,V2
export function _handleExercise(event: Exercise): void {
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  //above-below
  if (
    isContractRegisteredToAboveBelowRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowV2Router(optionContractInstance)
  ) {
    let userOptionData = _loadOrCreateAboveBelowOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();
  }
  //v2
  else {
    if (isContractRegisteredToV2Router(optionContractInstance)) {
      let userOptionData = _loadOrCreateOptionDataEntity(
        event.params.id,
        contractAddress
      );
      userOptionData.state = State.exercised;
      userOptionData.payout = event.params.profit;

      userOptionData.payout_usd = convertToUSD(
        event.params.profit,
        userOptionData.depositToken
      );
      userOptionData.expirationPrice = event.params.priceAtExpiration;
      userOptionData.closeTime = event.block.timestamp;
      userOptionData.isAbove = event.params.isAbove;
      userOptionData.save();
    }
  }
}

export function _handlePause(event: Pause): void {
  const optionContract = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(optionContract);

  if (
    isContractRegisteredToV2Router(optionContractInstance) ||
    isContractRegisteredToRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowV2Router(optionContractInstance)
  ) {
    optionContractInstance.isPaused = event.params.isPaused;
    optionContractInstance.save();
  }
}

export function _handleExpireV1(event: ExpireV1): void {
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  if (isContractRegisteredToRouter(optionContractInstance)) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.expired;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.closeTime = event.block.timestamp;
    userOptionData.save();
  }
}

export function _handleExerciseV1(event: ExerciseV1): void {
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  if (isContractRegisteredToRouter(optionContractInstance)) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.payout_usd = convertToUSD(
      event.params.profit,
      userOptionData.depositToken
    );
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();
  }
}

function convertToUSD(payoutInToken: BigInt, depositToken: string): BigInt {
  if (depositToken == "USDC") {
    return payoutInToken;
  } else if (depositToken == "ARB") {
    return convertARBToUSDC(payoutInToken);
  } else if (depositToken == "BFR") {
    return convertBFRToUSDC(payoutInToken);
  }
  return payoutInToken;
}
