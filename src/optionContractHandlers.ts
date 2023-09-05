import { Address } from "@graphprotocol/graph-ts";
import {
  BufferBinaryOptions,
  Create,
  Exercise,
  Expire,
  Pause,
  UpdateReferral,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import {
  Exercise as ExerciseV1,
  Expire as ExpireV1,
  V1Options,
} from "../generated/V1Options/V1Options";
import { updateClosingStats, updateOpeningStats } from "./aggregate";
import {
  ARBITRUM_SOLANA_ADDRESS,
  RouterAddress,
  State,
  V2_RouterAddress,
} from "./config";
import { convertARBToUSDC, convertBFRToUSDC } from "./convertToUSDC";
import { logUser, updateOptionContractData } from "./core";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateReferralData,
} from "./initialize";
import { referralAndNFTDiscountStats } from "./stats";

export function _handleCreate(event: Create): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  let v2RouterContract = BufferRouter.bind(
    Address.fromString(V2_RouterAddress)
  );
  if (
    v2RouterContract.try_contractRegistry(contractAddress).reverted == false &&
    v2RouterContract.try_contractRegistry(contractAddress).value == true
  ) {
    logUser(event.block.timestamp, event.params.account);
    let optionID = event.params.id;
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
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
      userOptionData.poolToken
    );
  }

  if (routerContract.contractRegistry(contractAddress) == true) {
    logUser(event.block.timestamp, event.params.account);
    let optionID = event.params.id;
    let optionContractInstance = V1Options.bind(contractAddress);
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
    userOptionData.state = optionData.value0;
    userOptionData.strike = optionData.value1;
    userOptionData.amount = optionData.value2;
    userOptionData.expirationTime = optionData.value5;
    // userOptionData.isAbove = isAbove;
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
      userOptionData.poolToken
    );
  }
}

export function _handleExpire(event: Expire): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  let v2RouterContract = BufferRouter.bind(
    Address.fromString(V2_RouterAddress)
  );

  if (
    routerContract.contractRegistry(contractAddress) == true ||
    (v2RouterContract.try_contractRegistry(contractAddress).reverted == false &&
      v2RouterContract.try_contractRegistry(contractAddress).value == true) ||
    contractAddress == Address.fromString(ARBITRUM_SOLANA_ADDRESS)
  ) {
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
      userOptionData.user,
      contractAddress,
      false,
      userOptionData.totalFee,
      userOptionData.totalFee
    );
  }
}

export function _handleExercise(event: Exercise): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  let v2RouterContract = BufferRouter.bind(
    Address.fromString(V2_RouterAddress)
  );
  if (
    routerContract.contractRegistry(contractAddress) == true ||
    (v2RouterContract.try_contractRegistry(contractAddress).reverted == false &&
      v2RouterContract.try_contractRegistry(contractAddress).value == true) ||
    contractAddress == Address.fromString(ARBITRUM_SOLANA_ADDRESS)
  ) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.closeTime = event.block.timestamp;
    userOptionData.save();

    updateClosingStats(
      userOptionData.depositToken,
      userOptionData.creationTime,
      userOptionData.totalFee,
      userOptionData.settlementFee,
      userOptionData.user,
      contractAddress,
      true,
      userOptionData.totalFee
        .minus(userOptionData.settlementFee)
        .minus(event.params.profit),
      event.params.profit.minus(userOptionData.totalFee)
    );
  }
}

export function _handleUpdateReferral(event: UpdateReferral): void {
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  let v2RouterContract = BufferRouter.bind(
    Address.fromString(V2_RouterAddress)
  );
  if (
    routerContract.contractRegistry(event.address) == true ||
    (v2RouterContract.try_contractRegistry(event.address).reverted == false &&
      v2RouterContract.try_contractRegistry(event.address).value == true)
  ) {
    let optionContractEntity = _loadOrCreateOptionContractEntity(event.address);
    let userReferralData = _loadOrCreateReferralData(event.params.user);
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

      let referrerReferralData = _loadOrCreateReferralData(
        event.params.referrer
      );
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

      let referrerReferralData = _loadOrCreateReferralData(
        event.params.referrer
      );
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

      let referrerReferralData = _loadOrCreateReferralData(
        event.params.referrer
      );
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
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  let v2RouterContract = BufferRouter.bind(
    Address.fromString(V2_RouterAddress)
  );

  if (
    routerContract.contractRegistry(event.address) == true ||
    (v2RouterContract.try_contractRegistry(event.address).reverted == false &&
      v2RouterContract.try_contractRegistry(event.address).value == true)
  ) {
    let isPaused = event.params.isPaused;
    let optionContract = _loadOrCreateOptionContractEntity(event.address);
    optionContract.isPaused = isPaused;
    optionContract.save();
  }
}

export function _handleExpireV1(event: ExpireV1): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));

  if (
    routerContract.contractRegistry(contractAddress) == true ||
    contractAddress == Address.fromString(ARBITRUM_SOLANA_ADDRESS)
  ) {
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
      userOptionData.user,
      contractAddress,
      false,
      userOptionData.totalFee,
      userOptionData.totalFee
    );
  }
}

export function _handleExerciseV1(event: ExerciseV1): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));

  if (
    routerContract.contractRegistry(contractAddress) == true ||
    contractAddress == Address.fromString(ARBITRUM_SOLANA_ADDRESS)
  ) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    updateClosingStats(
      userOptionData.depositToken,
      userOptionData.creationTime,
      userOptionData.totalFee,
      userOptionData.settlementFee,
      userOptionData.user,
      contractAddress,
      true,
      event.params.profit.minus(userOptionData.totalFee),
      event.params.profit.minus(userOptionData.totalFee)
    );
  }
}
