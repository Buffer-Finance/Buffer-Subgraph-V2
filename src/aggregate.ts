import { BigInt } from "@graphprotocol/graph-ts";
import { _getHourId } from "./helpers";
import {
  logOpenInterst,
  logVolumeAndSettlementFeePerContract,
} from "./loggers";

export function updateOpeningStats(
  timestamp: BigInt,
  contractAddress: string,
  totalFee: BigInt,
  settlementFee: BigInt,
  isAbove: boolean
): void {
  logVolumeAndSettlementFeePerContract(
    _getHourId(timestamp),
    "hourly",
    timestamp,
    contractAddress,
    totalFee,
    settlementFee
  );

  logOpenInterst(contractAddress, isAbove, totalFee, true);
}

export function updateClosingStats(
  contractAddress: string,
  totalFee: BigInt,
  isAbove: boolean
): void {
  logOpenInterst(contractAddress, isAbove, totalFee, false);
}
