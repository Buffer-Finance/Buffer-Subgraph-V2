import { BigInt } from "@graphprotocol/graph-ts";
export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const RouterAddress = "0xE450A00351A59AFc3cde65bA846AE561C584eDaC";
export const RouterAddress_2 = "";
export const ZeroAddress = "0x0000000000000000000000000000000000000000";
export const ONE = BigInt.fromI32(1);
