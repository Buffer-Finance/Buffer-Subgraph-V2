import { BigInt } from "@graphprotocol/graph-ts";
export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const RouterAddress = "0x62fAc96f91D943aD52A972FEebD631E39161eABc";
export const USDC_POOL_CONTRACT = "0x464c93cab18A051a24BD520bb97c22C583b48F01";
export const ARB_POOL_CONTRACT = "0x52126176479d8aFADF2Bc32eDe79dfDdFe69189c";
export const ZeroAddress = "0x0000000000000000000000000000000000000000";
export const ONE = BigInt.fromI32(1);
