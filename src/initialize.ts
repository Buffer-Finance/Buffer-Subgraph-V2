import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BufferBinaryOptions } from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import {
  ABQueuedOptionData,
  ABUserOptionData,
  ARBPoolStat,
  AssetTradingStat,
  BurnedBFR,
  DailyRevenueAndFee,
  DashboardStat,
  DefillamaFeeStat,
  FeeStat,
  Leaderboard,
  Market,
  OptionContract,
  OptionStat,
  PoolStat,
  ReferralData,
  TradingStat,
  Transaction,
  UserOptionData,
  UserRewards,
  UserStat,
  VolumeStat,
  WeeklyLeaderboard,
  WeeklyRevenueAndFee,
} from "../generated/schema";
import {
  ADDRESS_ZERO,
  AboveBelow_RouterAddress,
  RouterAddress,
  V2_RouterAddress,
  V2_RouterAddress_2,
  V2_RouterAddress_3,
} from "./config";
import { findPoolAndTokenFromPoolAddress } from "./configContractHandlers";
import { isContractRegisteredToRouter } from "./optionContractHandlers";

export const ZERO = BigInt.fromI32(0);

//TODO: Scan Config for settlement fee update
export function calculatePayout(settlementFeePercent: BigInt): BigInt {
  let payout = BigInt.fromI64(1000000000000000000).minus(
    settlementFeePercent.times(BigInt.fromI64(200000000000000))
  );
  return payout;
}

export function findRouterContract(address: string): string {
  const contractAddress = Address.fromString(address);
  const routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  const v2RouterContract = BufferRouter.bind(
    Address.fromString(V2_RouterAddress)
  );
  const v2RouterContract_2 = BufferRouter.bind(
    Address.fromString(V2_RouterAddress_2)
  );
  const v2RouterContract_3 = BufferRouter.bind(
    Address.fromString(V2_RouterAddress_3)
  );
  const aboveBelowRouterContract = BufferRouter.bind(
    Address.fromString(AboveBelow_RouterAddress)
  );

  if (routerContract.contractRegistry(contractAddress) == true) {
    return RouterAddress;
  } else if (
    aboveBelowRouterContract.try_contractRegistry(contractAddress).reverted ==
      false &&
    aboveBelowRouterContract.try_contractRegistry(contractAddress).value ==
      true &&
    aboveBelowRouterContract.contractRegistry(contractAddress) == true
  ) {
    return AboveBelow_RouterAddress;
  } else if (
    v2RouterContract.try_contractRegistry(contractAddress).reverted == false &&
    v2RouterContract.try_contractRegistry(contractAddress).value == true &&
    v2RouterContract.contractRegistry(contractAddress) == true
  ) {
    return V2_RouterAddress;
  } else if (
    v2RouterContract_2.try_contractRegistry(contractAddress).reverted ==
      false &&
    v2RouterContract_2.try_contractRegistry(contractAddress).value == true &&
    v2RouterContract_2.contractRegistry(contractAddress) == true
  ) {
    return V2_RouterAddress_2;
  } else if (
    v2RouterContract_3.try_contractRegistry(contractAddress).reverted ==
      false &&
    v2RouterContract_3.try_contractRegistry(contractAddress).value == true &&
    v2RouterContract_3.contractRegistry(contractAddress) == true
  ) {
    return V2_RouterAddress_3;
  } else {
    return ADDRESS_ZERO;
  }
}

export function _loadOrCreateOptionContractEntity(
  contractAddress: string
): OptionContract {
  let optionContract = OptionContract.load(contractAddress);
  if (optionContract == null) {
    optionContract = new OptionContract(contractAddress);
    optionContract.address = Address.fromString(contractAddress);
    optionContract.volume = ZERO;
    optionContract.tradeCount = 0;
    optionContract.openDown = ZERO;
    optionContract.openUp = ZERO;
    optionContract.openInterest = ZERO;
    optionContract.currentUtilization = ZERO;
    //    optionContract.payoutForDown = ZERO;
    //    optionContract.payoutForUp = ZERO;
    optionContract.isPaused = false;
    optionContract.category = -1;
    optionContract.openInterestDown = ZERO;
    optionContract.openInterestUp = ZERO;

    if (
      optionContract.routerContract == ADDRESS_ZERO ||
      optionContract.routerContract == null
    )
      optionContract.routerContract = findRouterContract(contractAddress);

    let optionContractPool = Address.fromString(ADDRESS_ZERO);
    if (optionContract.routerContract == ADDRESS_ZERO) {
      optionContract.isPaused = true;
      optionContract.asset = "unknown";
    } else {
      if (isContractRegisteredToRouter(optionContract)) {
        let optionContractInstance = BufferBinaryOptions.bind(
          Address.fromString(contractAddress)
        );
        optionContract.asset = optionContractInstance.assetPair();
        optionContractPool = optionContractInstance.pool();
      } else {
      }

      const tokenPool = findPoolAndTokenFromPoolAddress(optionContractPool);
      optionContract.token = tokenPool[0];
      optionContract.pool = tokenPool[1];
      optionContract.save();
    }
  }
  return optionContract as OptionContract;
}

export function _loadOrCreateTradingStatEntity(
  id: string,
  period: string,
  timestamp: BigInt
): TradingStat {
  let entity = TradingStat.load(id);
  if (entity == null) {
    entity = new TradingStat(id);
    entity.period = period;
    entity.profit = ZERO;
    entity.loss = ZERO;
    entity.profitCumulative = ZERO;
    entity.lossCumulative = ZERO;
    entity.profitUSDC = ZERO;
    entity.lossUSDC = ZERO;
    entity.profitCumulativeUSDC = ZERO;
    entity.lossCumulativeUSDC = ZERO;
    entity.profitARB = ZERO;
    entity.lossARB = ZERO;
    entity.profitCumulativeARB = ZERO;
    entity.lossCumulativeARB = ZERO;
    entity.profitBFR = ZERO;
    entity.lossBFR = ZERO;
    entity.profitCumulativeBFR = ZERO;
    entity.lossCumulativeBFR = ZERO;
    entity.openInterest = ZERO;
  }
  entity.timestamp = timestamp;
  return entity as TradingStat;
}

export function _loadOrCreateAssetTradingStatEntity(
  id: string,
  period: string,
  timestamp: BigInt,
  contractAddress: string,
  periodID: string
): AssetTradingStat {
  let entity = AssetTradingStat.load(id);
  if (entity == null) {
    entity = new AssetTradingStat(id);
    entity.period = period;
    entity.profit = ZERO;
    entity.profitARB = ZERO;
    entity.profitUSDC = ZERO;
    entity.profitBFR = ZERO;
    entity.loss = ZERO;
    entity.lossUSDC = ZERO;
    entity.lossARB = ZERO;
    entity.lossBFR = ZERO;
    entity.contractAddress = Address.fromString(contractAddress);
    entity.profitCumulative = ZERO;
    entity.profitCumulativeARB = ZERO;
    entity.profitCumulativeUSDC = ZERO;
    entity.profitCumulativeBFR = ZERO;
    entity.lossCumulative = ZERO;
    entity.lossCumulativeARB = ZERO;
    entity.lossCumulativeUSDC = ZERO;
    entity.lossCumulativeBFR = ZERO;
    entity.periodID = periodID;
  }
  entity.timestamp = timestamp;
  return entity as AssetTradingStat;
}

export function _loadOrCreateOptionDataEntity(
  optionID: BigInt,
  contractAddress: string
): UserOptionData {
  let referrenceID = `${optionID}${contractAddress}`;
  let entity = UserOptionData.load(referrenceID);
  if (entity == null) {
    entity = new UserOptionData(referrenceID);
    entity.optionID = optionID;
    entity.optionContract = contractAddress;
    entity.amount = ZERO;
    entity.totalFee = ZERO;
    entity.lag = ZERO;
    entity.creationEventTimeStamp = ZERO;
  }
  return entity as UserOptionData;
}

export function _loadOrCreateLeaderboardEntity(
  dayId: string,
  account: string
): Leaderboard {
  let referenceID = `${dayId}${account}`;
  let entity = Leaderboard.load(referenceID);
  if (entity == null) {
    entity = new Leaderboard(referenceID);
    entity.user = Address.fromString(account);
    entity.timestamp = dayId;
    entity.totalTrades = 0;
    entity.volume = ZERO;
    entity.netPnL = ZERO;
    entity.tradesWon = 0;
    entity.winRate = 0;
    entity.arbVolume = ZERO;
    entity.arbNetPnL = ZERO;
    entity.arbTotalTrades = 0;
    entity.arbTradesWon = 0;
    entity.arbWinRate = 0;
    entity.usdcVolume = ZERO;
    entity.usdcNetPnL = ZERO;
    entity.usdcTotalTrades = 0;
    entity.usdcTradesWon = 0;
    entity.usdcWinRate = 0;
    entity.bfrVolume = ZERO;
    entity.bfrNetPnL = ZERO;
    entity.bfrTotalTrades = 0;
    entity.bfrTradesWon = 0;
    entity.bfrWinRate = 0;
    entity.save();
  }
  return entity as Leaderboard;
}

export function _loadOrCreateWeeklyLeaderboardEntity(
  weekId: string,
  account: string
): WeeklyLeaderboard {
  let referenceID = `${weekId}${account}`;
  let entity = WeeklyLeaderboard.load(referenceID);
  if (entity == null) {
    entity = new WeeklyLeaderboard(referenceID);
    entity.user = Address.fromString(account);
    entity.timestamp = weekId;
    entity.totalTrades = 0;
    entity.volume = ZERO;
    entity.netPnL = ZERO;
    entity.tradesWon = 0;
    entity.winRate = 0;
    entity.arbVolume = ZERO;
    entity.arbNetPnL = ZERO;
    entity.arbTotalTrades = 0;
    entity.arbTradesWon = 0;
    entity.arbWinRate = 0;
    entity.usdcVolume = ZERO;
    entity.usdcNetPnL = ZERO;
    entity.usdcTotalTrades = 0;
    entity.usdcTradesWon = 0;
    entity.usdcWinRate = 0;
    entity.bfrVolume = ZERO;
    entity.bfrNetPnL = ZERO;
    entity.bfrTotalTrades = 0;
    entity.bfrTradesWon = 0;
    entity.bfrWinRate = 0;
    entity.save();
  }
  return entity as WeeklyLeaderboard;
}

export function _loadOrCreateUserStat(
  id: string,
  period: string,
  timestamp: BigInt
): UserStat {
  let userStat = UserStat.load(id);
  if (userStat == null) {
    userStat = new UserStat(id);
    userStat.period = period;
    userStat.timestamp = timestamp;
    userStat.uniqueCount = 0;
    userStat.uniqueCountCumulative = 0;
    userStat.users = [];
    userStat.existingCount = 0;
  }
  return userStat as UserStat;
}

export function _loadOrCreateVolumeStat(
  id: string,
  period: string,
  timestamp: BigInt
): VolumeStat {
  let entity = VolumeStat.load(id);
  if (entity === null) {
    entity = new VolumeStat(id);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.amount = ZERO;
    entity.VolumeUSDC = ZERO;
    entity.VolumeARB = ZERO;
    entity.VolumeBFR = ZERO;
    entity.save();
  }
  return entity as VolumeStat;
}

export function _loadOrCreateFeeStat(
  id: string,
  period: string,
  timestamp: BigInt
): FeeStat {
  let entity = FeeStat.load(id);
  if (entity === null) {
    entity = new FeeStat(id);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.fee = ZERO;
    entity.feeARB = ZERO;
    entity.feeUSDC = ZERO;
    entity.feeBFR = ZERO;
    entity.save();
  }
  return entity as FeeStat;
}

export function _loadOrCreateReferralData(user: string): ReferralData {
  let userReferralData = ReferralData.load(user);
  if (userReferralData == null) {
    userReferralData = new ReferralData(user);
    userReferralData.user = Address.fromString(user);
    userReferralData.totalDiscountAvailed = ZERO;
    userReferralData.totalDiscountAvailedARB = ZERO;
    userReferralData.totalDiscountAvailedUSDC = ZERO;
    userReferralData.totalDiscountAvailedBFR = ZERO;
    userReferralData.totalRebateEarned = ZERO;
    userReferralData.totalRebateEarnedUSDC = ZERO;
    userReferralData.totalRebateEarnedARB = ZERO;
    userReferralData.totalRebateEarnedBFR = ZERO;
    userReferralData.totalTradesReferred = 0;
    userReferralData.totalTradesReferredUSDC = 0;
    userReferralData.totalTradesReferredARB = 0;
    userReferralData.totalTradesReferredBFR = 0;
    userReferralData.totalTradingVolume = ZERO;
    userReferralData.totalTradingVolumeARB = ZERO;
    userReferralData.totalTradingVolumeUSDC = ZERO;
    userReferralData.totalTradingVolumeBFR = ZERO;
    userReferralData.totalVolumeOfReferredTrades = ZERO;
    userReferralData.totalVolumeOfReferredTradesUSDC = ZERO;
    userReferralData.totalVolumeOfReferredTradesARB = ZERO;
    userReferralData.totalVolumeOfReferredTradesBFR = ZERO;

    userReferralData.save();
  }
  return userReferralData as ReferralData;
}

export function _loadOrCreateDashboardStat(id: string): DashboardStat {
  let dashboardStat = DashboardStat.load(id);
  if (dashboardStat == null) {
    dashboardStat = new DashboardStat(id);
    dashboardStat.totalSettlementFees = ZERO;
    dashboardStat.totalVolume = ZERO;
    dashboardStat.totalTrades = 0;
    dashboardStat.openInterest = ZERO;
    dashboardStat.save();
  }
  return dashboardStat as DashboardStat;
}

export function _loadOrCreatePoolStat(id: string, period: string): PoolStat {
  let poolStat = PoolStat.load(id);
  if (poolStat == null) {
    poolStat = new PoolStat(id);
    poolStat.amount = ZERO;
    poolStat.period = period;
    poolStat.rate = ZERO;
  }
  return poolStat as PoolStat;
}

export function _loadOrCreateARBPoolStat(
  id: string,
  period: string
): ARBPoolStat {
  let poolStat = ARBPoolStat.load(id);
  if (poolStat == null) {
    poolStat = new ARBPoolStat(id);
    poolStat.amount = ZERO;
    poolStat.period = period;
    poolStat.rate = ZERO;
  }
  return poolStat as ARBPoolStat;
}

export function _loadOrCreateDailyRevenueAndFee(
  id: string,
  timestamp: BigInt,
  tokenId: string
): DailyRevenueAndFee {
  let lookUpId = `${id}${tokenId}`;
  let entity = DailyRevenueAndFee.load(lookUpId);
  if (entity === null) {
    entity = new DailyRevenueAndFee(lookUpId);
    entity.totalFee = ZERO;
    entity.settlementFee = ZERO;
    entity.timestamp = timestamp;
    entity.dayId = id;
    entity.tokenId = tokenId;
    entity.save();
  }
  return entity as DailyRevenueAndFee;
}

export function _loadOrCreateWeeklyRevenueAndFee(
  id: string,
  timestamp: BigInt,
  tokenId: string
): WeeklyRevenueAndFee {
  let lookUpId = `${id}${tokenId}`;
  let entity = WeeklyRevenueAndFee.load(lookUpId);
  if (entity === null) {
    entity = new WeeklyRevenueAndFee(lookUpId);
    entity.totalFee = ZERO;
    entity.settlementFee = ZERO;
    entity.timestamp = timestamp;
    entity.weekId = id;
    entity.tokenId = tokenId;
    entity.save();
  }
  return entity as WeeklyRevenueAndFee;
}

export function _loadOrCreateUserRewards(
  id: string,
  timestamp: BigInt
): UserRewards {
  let entity = UserRewards.load(id);
  if (entity === null) {
    entity = new UserRewards(id);
    entity.cumulativeReward = ZERO;
    entity.referralReward = ZERO;
    entity.nftDiscount = ZERO;
    entity.referralDiscount = ZERO;
    entity.period = "daily";
    entity.timestamp = timestamp;
    entity.save();
  }
  return entity as UserRewards;
}

export function _loadOrCreateDefillamaFeeStat(
  id: string,
  period: string,
  timestamp: BigInt
): DefillamaFeeStat {
  let entity = DefillamaFeeStat.load(id);
  if (entity === null) {
    entity = new DefillamaFeeStat(id);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.fee = ZERO;
    entity.save();
  }
  return entity as DefillamaFeeStat;
}

export function _loadOrCreateBurnedBFR(period: string, id: string): BurnedBFR {
  let entity = BurnedBFR.load(id);
  if (!entity) {
    entity = new BurnedBFR(id);
    entity.timestamp = ZERO;
    entity.period = period;
    entity.amount = ZERO;
    entity.cumulativeAmount = ZERO;
    entity.save();
  }
  return entity;
}

export function _loadOrCreateOptionStats(
  id: string,
  optionContract: string,
  token: string,
  user: string
): OptionStat {
  let entity = OptionStat.load(id);

  if (entity === null) {
    entity = new OptionStat(id);
    entity.optionContract = optionContract;
    entity.token = token;
    entity.tradeCount = 0;
    entity.openInterest = ZERO;
    entity.volume = ZERO;
    entity.volume_usd = ZERO;
    entity.payout = ZERO;
    entity.payout_usd = ZERO;
    entity.netPnl = ZERO;
    entity.netPnl_usd = ZERO;
    entity.tradesWon = 0;
    entity.user = Address.fromString(user);
    entity.tradesOpen = 0;
    entity.save();
  }

  return entity as OptionStat;
}

export function _loadOrCreateTransaction(
  id: string,
  transactionHash: string,
  // blockNumber: BigInt,
  // cumulativeGasUsed: BigInt,
  // gasUsed: BigInt,
  // contractAddress: Bytes,
  from: Bytes,
  to: Bytes,
  // input: string,
  eventName: string
): Transaction {
  let entity = Transaction.load(id);
  if (entity == null) {
    entity = new Transaction(id);
    entity.transactionHash = transactionHash;
    // entity.blockNumber = blockNumber;
    // entity.cumulativeGasUsed = cumulativeGasUsed;
    // entity.gasUsed = gasUsed;
    // entity.contractAddress = contractAddress;
    entity.from = from;
    entity.to = to;
    // entity.input = input;
    entity.eventName = eventName;
    entity.save();
  }
  return entity as Transaction;
}

export function _loadOrCreateMarket(id: Bytes): Market {
  let market = Market.load(id);
  if (market == null) {
    market = new Market(id);
    market.skew = ZERO;
  }
  return market as Market;
}

export function _loadOrCreateAboveBelowOptionDataEntity(
  optionID: BigInt,
  contractAddress: string
): ABUserOptionData {
  let referrenceID = `${optionID}${contractAddress}`;
  let entity = ABUserOptionData.load(referrenceID);
  if (entity == null) {
    entity = new ABUserOptionData(referrenceID);
    entity.optionID = optionID;
    entity.optionContract = contractAddress;
    entity.amount = ZERO;
    entity.totalFee = ZERO;
    entity.queuedTimestamp = ZERO;
    entity.lag = ZERO;
  }
  return entity as ABUserOptionData;
}

export function _loadOrCreateAboveBelowQueuedOptionEntity(
  queueID: BigInt,
  contractAddress: string
): ABQueuedOptionData {
  let referenceID = `${queueID}${contractAddress}`;
  let entity = ABQueuedOptionData.load(referenceID);
  if (entity == null) {
    entity = new ABQueuedOptionData(referenceID);
    entity.queueID = queueID;
    entity.optionContract = contractAddress;
    entity.queueTimestamp = ZERO;
    entity.cancelTimestamp = ZERO;
    entity.lag = ZERO;
    entity.processTime = ZERO;
    entity.maxFeePerContract = ZERO;
    entity.numberOfContracts = ZERO;
    entity.save();
  }
  return entity as ABQueuedOptionData;
}
