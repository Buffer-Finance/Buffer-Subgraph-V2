import { BigInt } from "@graphprotocol/graph-ts";

// export function _getDayId(timestamp: BigInt): string {
//   let dayTimestamp = (timestamp.toI32() - 16 * 3600) / 86400;
//   return dayTimestamp.toString();
// }

export function _getDayId(timestamp: BigInt): string {
  return _get5MinuteId(timestamp);
}

export function _getWeekId(timestamp: BigInt): string {
  let weekTimestamp = (timestamp.toI32() - 6 * 86400 - 16 * 3600) / (86400 * 7);
  return weekTimestamp.toString();
}

export function _getHourId(timestamp: BigInt): string {
  let hourTimestamp = (timestamp.toI32() - 16 * 3600) / 3600;
  return hourTimestamp.toString();
}

// export function _getLeaderboardWeekId(timestamp: BigInt): string {
//   let weekTimestamp = (timestamp.toI32() - 6 * 86400 - 16 * 3600) / (86400 * 7);
//   return weekTimestamp.toString();
// }

export function _getLeaderboardWeekId(timestamp: BigInt): string {
  return _get10MinuteId(timestamp);
}

export function _getDefillamaDayId(timestamp: BigInt): string {
  let dayTimestamp = timestamp.toI32() / 86400;
  return dayTimestamp.toString();
}

export function _get5MinuteId(timestamp: BigInt): string {
  let fiveMinuteTimestamp = (timestamp.toI32() - 16 * 3600) / 300;
  return fiveMinuteTimestamp.toString();
}

export function _get10MinuteId(timestamp: BigInt): string {
  let tenMinuteTimestamp = (timestamp.toI32() - 16 * 3600) / 600;
  return tenMinuteTimestamp.toString();
}
