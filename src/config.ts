import { BigInt } from "@graphprotocol/graph-ts";
export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const RouterAddress = "0x912B29A5efeA11d7994970799E82C3A7FB54a434";
export const ZeroAddress = "0x0000000000000000000000000000000000000000";

export const USDC_POOL_CONTRACT = "0x464c93cab18a051a24bd520bb97c22c583b48f01";
export const ARB_POOL_CONTRACT = "0x52126176479d8afadf2bc32ede79dfddfe69189c";
export const BFR_POOL_CONTRACT = "0x70086DFD2b089359A6582A18D24aBE1AcE40f8D0";

export const ONE = BigInt.fromI32(1);
