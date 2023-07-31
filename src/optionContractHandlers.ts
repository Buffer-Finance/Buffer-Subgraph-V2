import { Address } from "@graphprotocol/graph-ts";
import {
  Create,
  Expire,
  Exercise,
  UpdateReferral,
  Pause,
  BufferBinaryOptions,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { _getDayId, _getHourId, _getWeekId } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateReferralData,
} from "./initialize";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { convertARBToUSDC } from "./convertToUSDC";
import { State, RouterAddress, ARBITRUM_SOLANA_ADDRESS } from "./config";
import { updateOptionContractData } from "./core";
import { updateOpeningStats, updateClosingStats } from "./aggregate";
import { referralAndNFTDiscountStats } from "./stats";
import { UserOptionData } from "../generated/schema";
import { logUser } from "./core";

export function _handleCreate(event: Create): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.try_contractRegistry(contractAddress).reverted == false &&
    routerContract.try_contractRegistry(contractAddress).value == true
  ) {
    logUser(event.block.timestamp, event.params.account);
    let optionID = event.params.id;
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
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
    userOptionData.poolToken = poolToken;
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
  if (
    (routerContract.try_contractRegistry(contractAddress).reverted == false &&
      routerContract.try_contractRegistry(contractAddress).value) ||
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
      userOptionData.totalFee
    );
  }
}

export function _handleExercise(event: Exercise): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    (routerContract.try_contractRegistry(contractAddress).reverted == false &&
      routerContract.try_contractRegistry(contractAddress).value) ||
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
      event.params.profit.minus(userOptionData.totalFee)
    );
  }
}

export function _handleUpdateReferral(event: UpdateReferral): void {
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.try_contractRegistry(event.address).reverted == false &&
    routerContract.try_contractRegistry(event.address).value == true
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
    }
  }
}

export function _handlePause(event: Pause): void {
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.try_contractRegistry(event.address).reverted == false &&
    routerContract.try_contractRegistry(event.address).value == true
  ) {
    let isPaused = event.params.isPaused;
    let optionContract = _loadOrCreateOptionContractEntity(event.address);
    optionContract.isPaused = isPaused;
    optionContract.save();
  }
}
