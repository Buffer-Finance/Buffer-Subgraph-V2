import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
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
  updateClosingStats,
  updateClosingStatsV2,
  updateLpProfitAndLoss,
  updateOpeningStats,
} from "./aggregate";
import {
  RouterAddress,
  State,
  V2_RouterAddress,
  V2_RouterAddress_2,
  V2_RouterAddress_3,
  V2_RouterAddress_4,
  V2_RouterAddress_5,
  V2_RouterAddress_6,
  V2_RouterAddress_7,
} from "./config";
import { convertARBToUSDC, convertBFRToUSDC } from "./convertToUSDC";
import { logUser, updateOptionContractData } from "./core";
import {
  ZERO,
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
    optionContractInstance.routerContract == V2_RouterAddress_3 ||
    optionContractInstance.routerContract == V2_RouterAddress_4 ||
    optionContractInstance.routerContract == V2_RouterAddress_5 ||
    optionContractInstance.routerContract == V2_RouterAddress_6 ||
    optionContractInstance.routerContract == V2_RouterAddress_7
  );
}

function mapDecodedData(decodedData: ethereum.Tuple | null): string {
  if (decodedData !== null) {
    const queueId = `queueId: ${decodedData[0].toBigInt()},`;
    const timestamp = `timestamp: ${decodedData[1].toBigInt()},`;
    const price = `price: ${decodedData[2].toBigInt()},`;
    const signature = `signature: ${decodedData[3].toBytes().toString()},`;

    const stringValue = "{" + queueId + timestamp + price + signature + "}";
    return stringValue;
  }
  return "";
}

export function _handleCreate(event: Create): void {
  createTxnData(
    event.receipt,
    event.transaction,
    "Create",
    "(uint256,uint256,uint256,bytes)",
    mapDecodedData
  );
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);
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

export function _handleExpire(event: Expire): void {
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

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

export function _handleExercise(event: Exercise): void {
  let contractAddress = Address.fromBytes(event.address).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

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

export function _handleLpProfit(event: LpProfit): void {
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

export function _handleLpLoss(event: LpLoss): void {
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
    isContractRegisteredToRouter(optionContractInstance)
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
    isContractRegisteredToRouter(optionContractInstance)
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
