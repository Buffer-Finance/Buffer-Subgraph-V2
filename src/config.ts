import { BigInt } from "@graphprotocol/graph-ts";
export enum State {
  active = 1,
  exercised = 2,
  expired = 3,
  queued = 4,
  cancelled = 5,
  opened = 6,
}

export const AboveBelow_RouterAddress =
  "0xE450A00351A59AFc3cde65bA846AE561C584eDaC";
export const AboveBelow_RouterAddress_2 =
  "0x256b403E6973737DfdafbFAcEB2A2f4065265981";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

//V2 contracts
export const V2_RouterAddress = "0x3890F9664188a2A7292319Ce67320037BE634D3a";
export const V2_RouterAddress_2 = "0x075EEA84D1122A0c2F2A6C9265F8126F64087d44";
export const V2_RouterAddress_3 = "0xFd1EDa553d25448383FBD72bBE4530182266ed8D";

export const V2_USDC_ADDRESS = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
export const V2_ARB_TOKEN_ADDRESS =
  "0x912CE59144191C1204E64559FE8253a0e49E6548";

export const V2_USDC_POOL_CONTRACT =
  "0x6Ec7B10bF7331794adAaf235cb47a2A292cD9c7e";
export const V2_ARB_POOL_CONTRACT =
  "0xaE0628C88EC6C418B3F5C005f804E905f8123833";

//V1 contracts
export const RouterAddress = "0x0e0A1241C9cE6649d5D30134a194BA3E24130305";

export const ARBITRUM_SOLANA_ADDRESS =
  "0xFE9FAEAA880A6109F2ADF0E4257dC535c7a5Ba20";

export const BFR = "0x1A5B0aaF478bf1FDA7b934c76E7692D722982a6D";
export const USDC_ADDRESS = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
export const ARB_TOKEN_ADDRESS = "0x912CE59144191C1204E64559FE8253a0e49E6548";

export const USDC_POOL_CONTRACT = "0x6Ec7B10bF7331794adAaf235cb47a2A292cD9c7e";
export const ARB_POOL_CONTRACT = "0xaE0628C88EC6C418B3F5C005f804E905f8123833";
export const BFR_POOL_CONTRACT = "0xeAbEa290A623a648B3A8ab4B9AD668fb2063f8aB";
export const USDC_POL_POOL_CONTRACT =
  "0xfD9f8841C471Fcc55f5c09B8ad868BdC9eDeBDE1";

//mainnet uniswap contracts
export const ARB_UNISWAP_POOL_CONTRACT =
  "0x81c48D31365e6B526f6BBadC5c9aaFd822134863";
export const BFR_UNISWAP_POOL_CONTRACT =
  "0xD6D04709695935aAf80B2bd0215911bc2D3Bc1Ac";

export const ONE = BigInt.fromI32(1);
