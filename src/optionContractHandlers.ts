import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  AboveBelowBufferBinaryOptions,
  Create as CreateAB,
  CreateMarket,
} from "../generated/AboveBelowBufferBinaryOptions/AboveBelowBufferBinaryOptions";
import {
  BufferBinaryOptions,
  Create,
  Exercise,
  Expire,
  LpLoss,
  LpProfit,
  Pause,
  UpdateReferral,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  Exercise as ExerciseV1,
  Expire as ExpireV1,
  V1Options,
} from "../generated/V1Options/V1Options";
import { OptionContract } from "../generated/schema";
import {
  updateAboveBelowClosingStats,
  updateAboveBelowOpeningStats,
  updateClosingStats,
  updateClosingStatsV2,
  updateLpProfitAndLoss,
  updateOpeningStats,
} from "./aggregate";
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
import { logABUser, logUser, updateOptionContractData } from "./core";
import {
  ZERO,
  _loadOrCreateAboveBelowOptionDataEntity,
  _loadOrCreateMarket,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateReferralData,
} from "./initialize";
import { referralAndNFTDiscountStats } from "./stats";
import { createTxnData } from "./txnDataHandlers";

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
  createTxnData(event.receipt, event.transaction, "CreateAB");
  const contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  if (
    isContractRegisteredToAboveBelowRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowV2Router(optionContractInstance)
  ) {
    logABUser(
      event.block.timestamp,
      Address.fromBytes(event.params.account).toHexString()
    );
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

    const market = _loadOrCreateMarket(event.params.marketId);
    if (market.skew !== event.params.skew) {
      market.skew = event.params.skew;
      market.save();
    }

    updateAboveBelowOpeningStats(
      event.block.timestamp,
      contractAddress,
      userOptionData.totalFee,
      userOptionData.settlementFee,
      userOptionData.isAbove,
      userOptionData.depositToken,
      userOptionData.poolToken,
      Address.fromBytes(userOptionData.user).toHexString()
    );
  }
}

// Create - V1, V2
export function _handleCreate(event: Create): void {
  createTxnData(event.receipt, event.transaction, "Create");
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  //v2
  if (isContractRegisteredToV2Router(optionContractInstance)) {
    logUser(
      event.block.timestamp,
      Address.fromBytes(event.params.account).toHexString()
    );
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

    updateOpeningStats(
      userOptionData.depositToken,
      event.block.timestamp,
      totalFee,
      userOptionData.settlementFee,
      contractAddress,
      userOptionData.poolToken,
      Address.fromBytes(userOptionData.user).toHexString()
    );
  }

  //v1
  if (isContractRegisteredToRouter(optionContractInstance)) {
    logUser(
      event.block.timestamp,
      Address.fromBytes(event.params.account).toHexString()
    );
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

    updateOpeningStats(
      userOptionData.depositToken,
      event.block.timestamp,
      totalFee,
      userOptionData.settlementFee,
      contractAddress,
      userOptionData.poolToken,
      Address.fromBytes(userOptionData.user).toHexString()
    );
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
    createTxnData(event.receipt, event.transaction, "ExpireAB");

    let userOptionData = _loadOrCreateAboveBelowOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.expired;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    updateAboveBelowClosingStats(
      contractAddress,
      userOptionData.totalFee,
      userOptionData.isAbove,
      userOptionData.depositToken,
      userOptionData.totalFee,
      userOptionData.creationTime,
      Address.fromBytes(userOptionData.user).toHexString(),
      false,
      userOptionData.settlementFee,
      ZERO
    );
  }
  // v2
  else {
    createTxnData(event.receipt, event.transaction, "Expire");

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

      updateClosingStats(
        userOptionData.depositToken,
        userOptionData.creationTime,
        userOptionData.totalFee,
        userOptionData.settlementFee,
        Address.fromBytes(userOptionData.user).toHexString(),
        contractAddress,
        false,
        userOptionData.totalFee,
        ZERO
      );
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
    createTxnData(event.receipt, event.transaction, "ExerciseAB");

    let userOptionData = _loadOrCreateAboveBelowOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    updateAboveBelowClosingStats(
      contractAddress,
      userOptionData.totalFee,
      userOptionData.isAbove,
      userOptionData.depositToken,
      event.params.profit.minus(userOptionData.totalFee),
      userOptionData.creationTime,
      Address.fromBytes(userOptionData.user).toHexString(),
      true,
      userOptionData.settlementFee,
      event.params.profit
    );
  }
  //v2
  else {
    createTxnData(event.receipt, event.transaction, "Exercise");

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

      // updateClosingStats(
      //   userOptionData.depositToken,
      //   userOptionData.creationTime,
      //   userOptionData.totalFee,
      //   userOptionData.settlementFee,
      //   userOptionData.user,
      //   contractAddress,
      //   true,
      //   event.params.profit.minus(userOptionData.totalFee)
      // );

      updateClosingStatsV2(
        userOptionData.depositToken,
        userOptionData.creationTime,
        userOptionData.totalFee,
        Address.fromBytes(userOptionData.user).toHexString(),
        true,
        event.params.profit.minus(userOptionData.totalFee),
        contractAddress,
        event.params.profit
      );
    }
  }
}

//v2
export function _handleLpProfit(event: LpProfit): void {
  createTxnData(event.receipt, event.transaction, "LpProfit");
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  if (isContractRegisteredToV2Router(optionContractInstance)) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddress
    );
    updateLpProfitAndLoss(
      userOptionData.depositToken,
      userOptionData.creationTime,
      contractAddress,
      false,
      event.params.amount
    );
  }
}

//v2
export function _handleLpLoss(event: LpLoss): void {
  createTxnData(event.receipt, event.transaction, "LpLoss");
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  if (isContractRegisteredToV2Router(optionContractInstance)) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddress
    );
    updateLpProfitAndLoss(
      userOptionData.depositToken,
      userOptionData.creationTime,
      contractAddress,
      true,
      event.params.amount
    );
  }
}

export function _handleUpdateReferral(event: UpdateReferral): void {
  const optionContract = Address.fromBytes(event.address).toHexString();
  const referrer = Address.fromBytes(event.params.referrer).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(optionContract);

  if (
    isContractRegisteredToV2Router(optionContractInstance) ||
    isContractRegisteredToRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowRouter(optionContractInstance) ||
    isContractRegisteredToAboveBelowV2Router(optionContractInstance)
  ) {
    let optionContractEntity =
      _loadOrCreateOptionContractEntity(optionContract);
    let userReferralData = _loadOrCreateReferralData(
      Address.fromBytes(event.params.user).toHexString()
    );
    if (optionContractEntity.token == "USDC") {
      userReferralData.totalDiscountAvailed =
        userReferralData.totalDiscountAvailed.plus(event.params.rebate);
      userReferralData.totalDiscountAvailedUSDC =
        userReferralData.totalDiscountAvailedUSDC.plus(event.params.rebate);
      userReferralData.totalTradingVolume =
        userReferralData.totalTradingVolume.plus(event.params.totalFee);
      userReferralData.totalTradingVolumeUSDC =
        userReferralData.totalTradingVolumeUSDC.plus(event.params.totalFee);
      userReferralData.save();

      let referrerReferralData = _loadOrCreateReferralData(referrer);
      referrerReferralData.totalTradesReferred += 1;
      referrerReferralData.totalTradesReferredUSDC += 1;
      referrerReferralData.totalVolumeOfReferredTrades =
        referrerReferralData.totalVolumeOfReferredTrades.plus(
          event.params.totalFee
        );
      referrerReferralData.totalVolumeOfReferredTradesUSDC =
        referrerReferralData.totalVolumeOfReferredTradesUSDC.plus(
          event.params.totalFee
        );
      referrerReferralData.totalRebateEarned =
        referrerReferralData.totalRebateEarned.plus(event.params.referrerFee);
      referrerReferralData.totalRebateEarnedUSDC =
        referrerReferralData.totalRebateEarnedUSDC.plus(
          event.params.referrerFee
        );
      referrerReferralData.save();

      referralAndNFTDiscountStats(
        event.block.timestamp,
        event.params.rebate,
        event.params.referrerFee
      );
    } else if (optionContractEntity.token == "ARB") {
      userReferralData.totalDiscountAvailed =
        userReferralData.totalDiscountAvailed.plus(
          convertARBToUSDC(event.params.rebate)
        );
      userReferralData.totalDiscountAvailedARB =
        userReferralData.totalDiscountAvailedARB.plus(event.params.rebate);
      userReferralData.totalTradingVolume =
        userReferralData.totalTradingVolume.plus(
          convertARBToUSDC(event.params.totalFee)
        );
      userReferralData.totalTradingVolumeARB =
        userReferralData.totalTradingVolumeARB.plus(event.params.totalFee);
      userReferralData.save();

      let referrerReferralData = _loadOrCreateReferralData(referrer);
      referrerReferralData.totalTradesReferred += 1;
      referrerReferralData.totalTradesReferredARB += 1;

      referrerReferralData.totalVolumeOfReferredTrades =
        referrerReferralData.totalVolumeOfReferredTrades.plus(
          convertARBToUSDC(event.params.totalFee)
        );
      referrerReferralData.totalVolumeOfReferredTradesARB =
        referrerReferralData.totalVolumeOfReferredTradesARB.plus(
          event.params.totalFee
        );
      referrerReferralData.totalRebateEarned =
        referrerReferralData.totalRebateEarned.plus(
          convertARBToUSDC(event.params.referrerFee)
        );
      referrerReferralData.totalRebateEarnedARB =
        referrerReferralData.totalRebateEarnedARB.plus(
          event.params.referrerFee
        );
      referrerReferralData.save();

      referralAndNFTDiscountStats(
        event.block.timestamp,
        convertARBToUSDC(event.params.rebate),
        convertARBToUSDC(event.params.referrerFee)
      );
    } else if (optionContractEntity.token == "BFR") {
      userReferralData.totalDiscountAvailed =
        userReferralData.totalDiscountAvailed.plus(
          convertBFRToUSDC(event.params.rebate)
        );
      userReferralData.totalDiscountAvailedBFR =
        userReferralData.totalDiscountAvailedBFR.plus(event.params.rebate);
      userReferralData.totalTradingVolume =
        userReferralData.totalTradingVolume.plus(
          convertBFRToUSDC(event.params.totalFee)
        );
      userReferralData.totalTradingVolumeBFR =
        userReferralData.totalTradingVolumeBFR.plus(event.params.totalFee);
      userReferralData.save();

      let referrerReferralData = _loadOrCreateReferralData(referrer);
      referrerReferralData.totalTradesReferred += 1;
      referrerReferralData.totalTradesReferredBFR += 1;

      referrerReferralData.totalVolumeOfReferredTrades =
        referrerReferralData.totalVolumeOfReferredTrades.plus(
          convertBFRToUSDC(event.params.totalFee)
        );
      referrerReferralData.totalVolumeOfReferredTradesBFR =
        referrerReferralData.totalVolumeOfReferredTradesBFR.plus(
          event.params.totalFee
        );
      referrerReferralData.totalRebateEarned =
        referrerReferralData.totalRebateEarned.plus(
          convertBFRToUSDC(event.params.referrerFee)
        );
      referrerReferralData.totalRebateEarnedBFR =
        referrerReferralData.totalRebateEarnedBFR.plus(
          event.params.referrerFee
        );
      referrerReferralData.save();

      referralAndNFTDiscountStats(
        event.block.timestamp,
        convertBFRToUSDC(event.params.rebate),
        convertBFRToUSDC(event.params.referrerFee)
      );
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
  createTxnData(event.receipt, event.transaction, "ExpireV1");
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

    updateClosingStats(
      userOptionData.depositToken,
      userOptionData.creationTime,
      userOptionData.totalFee,
      userOptionData.settlementFee,
      Address.fromBytes(userOptionData.user).toHexString(),
      contractAddress,
      false,
      userOptionData.totalFee,
      ZERO
    );
  }
}

export function _handleExerciseV1(event: ExerciseV1): void {
  createTxnData(event.receipt, event.transaction, "ExerciseV1");
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

    updateClosingStats(
      userOptionData.depositToken,
      userOptionData.creationTime,
      userOptionData.totalFee,
      userOptionData.settlementFee,
      Address.fromBytes(userOptionData.user).toHexString(),
      contractAddress,
      true,
      event.params.profit.minus(userOptionData.totalFee),
      event.params.profit
    );
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

export function _handleCreateMarket(event: CreateMarket): void {
  const optionContract = _loadOrCreateOptionContractEntity(
    event.params.optionsContract.toHexString()
  );
  const market = _loadOrCreateMarket(event.params.marketId);
  market.optionContract = optionContract.id;
  market.strike = event.params.strike;
  market.expiration = event.params.expiration;
  market.save();
}
