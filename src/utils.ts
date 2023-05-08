import { BigInt } from "@graphprotocol/graph-ts";

export function _getDayId(timestamp: BigInt): string {
  let dayTimestamp = (timestamp.toI32() - 16 * 3600) / 86400;
  return dayTimestamp.toString();
}
