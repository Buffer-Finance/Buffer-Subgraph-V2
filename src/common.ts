import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { OptionContract, Trade } from "../generated/schema";
import {
  ARB_POOL_CONTRACT,
  AboveBelow_RouterAddress_2,
  BFR_POOL_CONTRACT,
  USDC_POOL_CONTRACT,
  V2_RouterAddress_3,
  ZERO,
} from "./config";
import { convertARBToUSDC, convertBFRToUSDC } from "./convertToUSDC";
import { updateDailyAndWeeklyRevenue, updateLeaderboards } from "./leaderboard";

export function checkTimeThreshold(blockTimestamp: BigInt): boolean {
  const threshold = BigInt.fromI32(1711123200); //16th March 16pm UTC
  return blockTimestamp.gt(threshold);
}

export function registerAmarket(
  targetContract: Bytes,
  routerAddress: Bytes
): void {
  const market = OptionContract.load(targetContract.toHexString());
  if (market == null) {
    const market = new OptionContract(
      targetContract.toHexString().toLowerCase()
    );
    market.address = targetContract;
    market.routerContract = routerAddress;
    market.pool = "UNKNOWN";
    market.save();
  }
}

export function isRegisteredToV2Router(targetContract: Bytes): boolean {
  const market = OptionContract.load(targetContract.toHexString());
  if (market) {
    return market.routerContract == Address.fromString(V2_RouterAddress_3);
  }
  return false;
}

export function isRegisteredTOABRouter(targetContract: Bytes): boolean {
  const market = OptionContract.load(targetContract.toHexString());
  if (market) {
    return (
      market.routerContract == Address.fromString(AboveBelow_RouterAddress_2)
    );
  }
  return false;
}

export function getPoolNameFromAddress(poolAddress: Bytes): string {
  if (poolAddress == Address.fromString(USDC_POOL_CONTRACT)) {
    return "USDC";
  } else if (poolAddress == Address.fromString(ARB_POOL_CONTRACT)) {
    return "ARB";
  } else if (poolAddress == Address.fromString(BFR_POOL_CONTRACT)) {
    return "BFR";
  } else {
    return "NOPE";
  }
}

export function updateAMarket(
  market: OptionContract,
  poolAddress: Bytes
): void {
  market.pool = getPoolNameFromAddress(poolAddress);
  market.save();
}

export function convertToUSD(
  payoutInToken: BigInt,
  depositToken: string
): BigInt {
  if (depositToken == "USDC") {
    return payoutInToken;
  } else if (depositToken == "ARB") {
    return convertARBToUSDC(payoutInToken);
  } else if (depositToken == "BFR") {
    return convertBFRToUSDC(payoutInToken);
  }
  return payoutInToken;
}

export function _createTradeEntity(
  tradeId: BigInt,
  marketAddress: Bytes,
  userAddress: Bytes,
  volume: BigInt,
  fee: BigInt,
  depositToken: string
): void {
  const trade = new Trade(
    tradeId.toString() + marketAddress.toHexString().toLowerCase()
  );
  trade.userAddress = userAddress;
  trade.volume = volume;
  trade.token = depositToken;
  trade.fee = fee;
  trade.save();
}

export function updateOrCreateLeaderboards(
  totalFee: BigInt,
  token: string,
  netPnL: BigInt,
  timestamp: BigInt,
  user: string,
  isExercised: boolean,
  settlementFee: BigInt
): void {
  let positiveNetPnl = netPnL;

  if (netPnL.lt(ZERO)) {
    positiveNetPnl = ZERO.minus(netPnL);
  }
  if (token == "USDC") {
    // Update Leaderboards
    updateLeaderboards(
      totalFee,
      timestamp,
      user,
      isExercised && netPnL.gt(ZERO),
      ZERO,
      false,
      totalFee,
      true,
      positiveNetPnl,
      ZERO,
      positiveNetPnl,
      ZERO,
      false,
      ZERO
    );

    updateDailyAndWeeklyRevenue(totalFee, timestamp, settlementFee, "total");
  } else if (token == "ARB") {
    const settlementFeeUSDC = convertARBToUSDC(settlementFee);
    let totalFeeUSDC = convertARBToUSDC(totalFee);
    let positiveNetPnlUSDC = convertARBToUSDC(positiveNetPnl);

    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isExercised && netPnL.gt(ZERO),
      totalFee,
      true,
      ZERO,
      false,
      positiveNetPnlUSDC,
      positiveNetPnl,
      ZERO,
      ZERO,
      false,
      ZERO
    );

    updateDailyAndWeeklyRevenue(
      totalFeeUSDC,
      timestamp,
      settlementFeeUSDC,
      "total"
    );
  } else if (token == "BFR") {
    let totalFeeUSDC = convertBFRToUSDC(totalFee);
    let positiveNetPnlUSDC = convertBFRToUSDC(positiveNetPnl);
    let settlementFeeUSDC = convertBFRToUSDC(settlementFee);

    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isExercised && netPnL.gt(ZERO),
      ZERO,
      false,
      ZERO,
      false,
      positiveNetPnlUSDC,
      ZERO,
      ZERO,
      positiveNetPnl,
      true,
      totalFee
    );

    updateDailyAndWeeklyRevenue(
      totalFeeUSDC,
      timestamp,
      settlementFeeUSDC,
      "total"
    );
  }
}
