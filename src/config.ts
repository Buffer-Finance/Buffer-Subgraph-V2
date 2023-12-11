import { BigInt } from "@graphprotocol/graph-ts";
export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const RouterAddress = "0x9bE7abE78A8fc78eDc763fDB864B50c6e98ACB97";
export const ZeroAddress = "0x0000000000000000000000000000000000000000";
export const ONE = BigInt.fromI32(1);
