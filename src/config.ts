import { Address, BigInt } from "@graphprotocol/graph-ts";

export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const ZERO = BigInt.fromI32(0);
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const ADDRESS_ZERO_BYTES = Address.fromString(ADDRESS_ZERO);

export const RouterAddress = "0xEE4FfF95FcBc7e7DcfF5DE21b8a6AA4C13322e00";
export const RouterAddressBytes = Address.fromString(RouterAddress);
export const USDC_ADDRESS = "0x658e6B62e7ab1d2B29a08F85f8442edEed562b48";
export const BFR = "0x89fEF05446aEA764C53a2f09bB763876FB57ea8E";
export const ARBITRUM_SOLANA_ADDRESS =
  "0x0000000000000000000000000000000000000000";
export const ARB_TOKEN_ADDRESS = "0x76Bd15f52dd4A6B274f2C19b16F4934eC27615a8";
export const USDC_POOL_CONTRACT = "0x1CDA6A34D84F444183E89D2D41D920EeaE883439";
export const ARB_POOL_CONTRACT = "0xfa7C3782d45eC60624C67891C60e2FAE17fE4cE6";
export const BFR_POOL_CONTRACT = "0x70086DFD2b089359A6582A18D24aBE1AcE40f8D0";
export const USDC_POL_POOL_CONTRACT =
  "0x0000000000000000000000000000000000000000";
