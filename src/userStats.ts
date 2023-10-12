import { BigInt } from "@graphprotocol/graph-ts";
import { _loadOrCreateOptionStats } from "./initialize";

export function updateTradeOpenStatsForUser(
  volume: BigInt,
  volumeUSD: BigInt,
  userAddress: string,
  optionContractAddress: string,
  token: string
): void {
  const statsEntity = _loadOrCreateOptionStats(
    optionContractAddress + "&" + userAddress,
    optionContractAddress,
    token,
    userAddress
  );
  statsEntity.volume = statsEntity.volume.plus(volume);
  statsEntity.volume_usd = statsEntity.volume_usd.plus(volumeUSD);
  statsEntity.openInterest = statsEntity.openInterest.plus(volume);
  statsEntity.tradeCount += 1;
  statsEntity.tradesOpen += 1;
  statsEntity.save();
}

export function updateTradeClosingStatsForUser(
  userAddress: string,
  volume: BigInt,
  payout: BigInt,
  payout_usd: BigInt,
  pnl: BigInt,
  pnl_usd: BigInt,
  isWinningTrade: boolean,
  optionContractAddress: string,
  token: string
): void {
  const statsEntity = _loadOrCreateOptionStats(
    optionContractAddress + "&" + userAddress,
    optionContractAddress,
    token,
    userAddress
  );
  statsEntity.tradesOpen -= 1;
  statsEntity.openInterest = statsEntity.openInterest.minus(volume);
  statsEntity.payout = statsEntity.payout.plus(payout);
  statsEntity.payout_usd = statsEntity.payout_usd.plus(payout_usd);
  if (isWinningTrade) {
    statsEntity.tradesWon += 1;
    statsEntity.netPnl = statsEntity.netPnl.plus(pnl);
    statsEntity.netPnl_usd = statsEntity.netPnl_usd.plus(pnl_usd);
  } else {
    statsEntity.netPnl = statsEntity.netPnl.minus(pnl);
    statsEntity.netPnl_usd = statsEntity.netPnl_usd.minus(pnl_usd);
  }
  statsEntity.save();
}
