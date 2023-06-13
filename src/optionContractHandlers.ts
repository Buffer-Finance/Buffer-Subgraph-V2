import { Address } from "@graphprotocol/graph-ts";
import {
  Create,
  Expire,
  Exercise,
  UpdateReferral,
  Pause,
  BufferBinaryOptions,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  ZERO,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateReferralData,
} from "./initialize";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { convertARBToUSDC, convertBFRToUSDC } from "./convertToUSDC";
import { State, RouterAddress, ARBITRUM_SOLANA_ADDRESS } from "./config";
import { updateOptionContractData } from "./core";
import { updateOpeningStats, updateClosingStats } from "./aggregate";
import { referralAndNFTDiscountStats } from "./stats";

export function _handleCreate(event: Create): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.contractRegistry(event.address) == true ||
    event.address == Address.fromString("0x01f67172ff59F4aCD7ac3C48d164F3c624AA0cB3") ||
    event.address == Address.fromString("0x830C99C6f94B28B2b8C0d218ABb96460F2C4e81e") ||
    event.address == Address.fromString("0x0d7d3D9D1E7bfDF6663380776A71D1FD0667Dd0c") ||
    event.address == Address.fromString("0x541F4386A74632fea79C4A3A88eC2d02AE715939") ||
    event.address == Address.fromString("0x0E6E02869012954eB16b83faA36e7bE229F35B0D") ||
    event.address == Address.fromString("0xFD295d8993E46c632C82269820323243aE67288E") ||
    event.address == Address.fromString("0x78089a27b809e3e2E575a2C31D21F59BdAb0926f") ||
    event.address == Address.fromString("0x29ea7b97488aF38AFa13e0f7a58568A3a1c85204")
  ) {  
    let optionID = event.params.id;
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
    let optionData = optionContractInstance.options(optionID);
    let isAbove = optionData.value6 ? true : false;
    let totalFee = event.params.totalFee;
    let poolToken = updateOptionContractData(
      true,
      isAbove,
      totalFee,
      contractAddress
    );
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
    userOptionData.isAbove = isAbove;
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
      isAbove,
      contractAddress,
      userOptionData.poolToken
    );
  }
}

export function _handleExpire(event: Expire): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.contractRegistry(event.address) == true ||
    contractAddress == Address.fromString(ARBITRUM_SOLANA_ADDRESS) ||
    event.address == Address.fromString("0x01f67172ff59F4aCD7ac3C48d164F3c624AA0cB3") ||
    event.address == Address.fromString("0x830C99C6f94B28B2b8C0d218ABb96460F2C4e81e") ||
    event.address == Address.fromString("0x0d7d3D9D1E7bfDF6663380776A71D1FD0667Dd0c") ||
    event.address == Address.fromString("0x541F4386A74632fea79C4A3A88eC2d02AE715939") ||
    event.address == Address.fromString("0x0E6E02869012954eB16b83faA36e7bE229F35B0D") ||
    event.address == Address.fromString("0xFD295d8993E46c632C82269820323243aE67288E") ||
    event.address == Address.fromString("0x78089a27b809e3e2E575a2C31D21F59BdAb0926f") ||
    event.address == Address.fromString("0x29ea7b97488aF38AFa13e0f7a58568A3a1c85204")
  ) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddress
    );
    userOptionData.state = State.expired;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    
    updateClosingStats(
      userOptionData.depositToken,
      userOptionData.creationTime,
      userOptionData.totalFee,
      userOptionData.settlementFee,
      userOptionData.isAbove,
      userOptionData.user,
      contractAddress,
      false,
      userOptionData.totalFee,
      ZERO
    );
  }
}

export function _handleExercise(event: Exercise): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.contractRegistry(event.address) == true ||
    contractAddress == Address.fromString(ARBITRUM_SOLANA_ADDRESS) ||
    event.address == Address.fromString("0x01f67172ff59F4aCD7ac3C48d164F3c624AA0cB3") ||
    event.address == Address.fromString("0x830C99C6f94B28B2b8C0d218ABb96460F2C4e81e") ||
    event.address == Address.fromString("0x0d7d3D9D1E7bfDF6663380776A71D1FD0667Dd0c") ||
    event.address == Address.fromString("0x541F4386A74632fea79C4A3A88eC2d02AE715939") ||
    event.address == Address.fromString("0x0E6E02869012954eB16b83faA36e7bE229F35B0D") ||
    event.address == Address.fromString("0xFD295d8993E46c632C82269820323243aE67288E") ||
    event.address == Address.fromString("0x78089a27b809e3e2E575a2C31D21F59BdAb0926f") ||
    event.address == Address.fromString("0x29ea7b97488aF38AFa13e0f7a58568A3a1c85204")
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
      userOptionData.isAbove,
      userOptionData.user,
      contractAddress,
      true,
      event.params.profit.minus(userOptionData.totalFee),
      event.params.profit
    );
  }
}

export function _handleUpdateReferral(event: UpdateReferral): void {
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  let optionContractEntity = _loadOrCreateOptionContractEntity(event.address);
  if (
    routerContract.contractRegistry(event.address) == true ||
    event.address == Address.fromString("0x01f67172ff59F4aCD7ac3C48d164F3c624AA0cB3") ||
    event.address == Address.fromString("0x830C99C6f94B28B2b8C0d218ABb96460F2C4e81e") ||
    event.address == Address.fromString("0x0d7d3D9D1E7bfDF6663380776A71D1FD0667Dd0c") ||
    event.address == Address.fromString("0x541F4386A74632fea79C4A3A88eC2d02AE715939") ||
    event.address == Address.fromString("0x0E6E02869012954eB16b83faA36e7bE229F35B0D") ||
    event.address == Address.fromString("0xFD295d8993E46c632C82269820323243aE67288E") ||
    event.address == Address.fromString("0x78089a27b809e3e2E575a2C31D21F59BdAb0926f") ||
    event.address == Address.fromString("0x29ea7b97488aF38AFa13e0f7a58568A3a1c85204")
  ) {
    let userReferralData = _loadOrCreateReferralData(event.params.user);
    if (optionContractEntity.token == "USDC") {
      userReferralData.totalDiscountAvailed = userReferralData.totalDiscountAvailed.plus(
        event.params.rebate
      );
      userReferralData.totalDiscountAvailedUSDC = userReferralData.totalDiscountAvailedUSDC.plus(
        event.params.rebate
      );
      userReferralData.totalTradingVolume = userReferralData.totalTradingVolume.plus(
        event.params.totalFee
      );
      userReferralData.totalTradingVolumeUSDC = userReferralData.totalTradingVolumeUSDC.plus(
        event.params.totalFee
      );
      userReferralData.save();

      let referrerReferralData = _loadOrCreateReferralData(
        event.params.referrer
      );
      referrerReferralData.totalTradesReferred += 1;
      referrerReferralData.totalTradesReferredUSDC += 1;
      referrerReferralData.totalVolumeOfReferredTrades = referrerReferralData.totalVolumeOfReferredTrades.plus(
        event.params.totalFee
      );
      referrerReferralData.totalVolumeOfReferredTradesUSDC = referrerReferralData.totalVolumeOfReferredTradesUSDC.plus(
        event.params.totalFee
      );
      referrerReferralData.totalRebateEarned = referrerReferralData.totalRebateEarned.plus(
        event.params.referrerFee
      );
      referrerReferralData.totalRebateEarnedUSDC = referrerReferralData.totalRebateEarnedUSDC.plus(
        event.params.referrerFee
      );
      referrerReferralData.save();

      referralAndNFTDiscountStats(
        event.block.timestamp,
        event.params.rebate,
        event.params.referrerFee
      );
    } else if (optionContractEntity.token == "ARB") {
      userReferralData.totalDiscountAvailed = userReferralData.totalDiscountAvailed.plus(
        convertARBToUSDC(event.params.rebate)
      );
      userReferralData.totalDiscountAvailedARB = userReferralData.totalDiscountAvailedARB.plus(
        event.params.rebate
      );
      userReferralData.totalTradingVolume = userReferralData.totalTradingVolume.plus(
        convertARBToUSDC(event.params.totalFee)
      );
      userReferralData.totalTradingVolumeARB = userReferralData.totalTradingVolumeARB.plus(
        event.params.totalFee
      );
      userReferralData.save();

      let referrerReferralData = _loadOrCreateReferralData(
        event.params.referrer
      );
      referrerReferralData.totalTradesReferred += 1;
      referrerReferralData.totalTradesReferredARB += 1;

      referrerReferralData.totalVolumeOfReferredTrades = referrerReferralData.totalVolumeOfReferredTrades.plus(
        convertARBToUSDC(event.params.totalFee)
      );
      referrerReferralData.totalVolumeOfReferredTradesARB = referrerReferralData.totalVolumeOfReferredTradesARB.plus(
        event.params.totalFee
      );
      referrerReferralData.totalRebateEarned = referrerReferralData.totalRebateEarned.plus(
        convertARBToUSDC(event.params.referrerFee)
      );
      referrerReferralData.totalRebateEarnedARB = referrerReferralData.totalRebateEarnedARB.plus(
        event.params.referrerFee
      );
      referrerReferralData.save();

      referralAndNFTDiscountStats(
        event.block.timestamp,
        convertARBToUSDC(event.params.rebate),
        convertARBToUSDC(event.params.referrerFee)
      );
    } else if (optionContractEntity.token == "BFR") {
      userReferralData.totalDiscountAvailed = userReferralData.totalDiscountAvailed.plus(
        convertBFRToUSDC(event.params.rebate)
      );
      userReferralData.totalDiscountAvailedBFR = userReferralData.totalDiscountAvailedBFR.plus(
        event.params.rebate
      );
      userReferralData.totalTradingVolume = userReferralData.totalTradingVolume.plus(
        convertBFRToUSDC(event.params.totalFee)
      );
      userReferralData.totalTradingVolumeBFR = userReferralData.totalTradingVolumeBFR.plus(
        event.params.totalFee
      );
      userReferralData.save();

      let referrerReferralData = _loadOrCreateReferralData(
        event.params.referrer
      );
      referrerReferralData.totalTradesReferred += 1;
      referrerReferralData.totalTradesReferredBFR += 1;

      referrerReferralData.totalVolumeOfReferredTrades = referrerReferralData.totalVolumeOfReferredTrades.plus(
        convertBFRToUSDC(event.params.totalFee)
      );
      referrerReferralData.totalVolumeOfReferredTradesBFR = referrerReferralData.totalVolumeOfReferredTradesBFR.plus(
        event.params.totalFee
      );
      referrerReferralData.totalRebateEarned = referrerReferralData.totalRebateEarned.plus(
        convertBFRToUSDC(event.params.referrerFee)
      );
      referrerReferralData.totalRebateEarnedBFR = referrerReferralData.totalRebateEarnedBFR.plus(
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
  if (routerContract.contractRegistry(event.address) == true) {
    let isPaused = event.params.isPaused;
    let optionContract = _loadOrCreateOptionContractEntity(event.address);
    optionContract.isPaused = isPaused;
    optionContract.save();
  }
}
