import { BigInt } from "@graphprotocol/graph-ts";
export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const RouterAddress = "0x636D2D526073bF03024D716DbE781a37C840Bce0";
export const ZeroAddress = "0x0000000000000000000000000000000000000000";
export const ONE = BigInt.fromI32(1);
