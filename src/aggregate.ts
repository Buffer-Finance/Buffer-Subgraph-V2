import { BigInt } from "@graphprotocol/graph-ts";
import { _getHourId } from "./helpers";
import { logVolumeAndSettlementFeePerContract } from "./loggers";

export function updateOpeningStats(
  timestamp: BigInt,
  contractAddress: string,
  totalFee: BigInt,
  settlementFee: BigInt
): void {
  logVolumeAndSettlementFeePerContract(
    _getHourId(timestamp),
    "hourly",
    timestamp,
    contractAddress,
    totalFee,
    settlementFee
  );
}
