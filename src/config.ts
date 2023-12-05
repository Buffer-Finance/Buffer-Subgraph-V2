import { BigInt } from "@graphprotocol/graph-ts";
export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const RouterAddress = "0x6e57AAb1659f7f787F893adD176bA15F0e2Be067";
export const ZeroAddress = "0x0000000000000000000000000000000000000000";
export const ONE = BigInt.fromI32(1);
