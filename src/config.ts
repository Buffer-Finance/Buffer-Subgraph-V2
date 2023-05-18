import { BigInt } from "@graphprotocol/graph-ts";

export const Slabs = [
  [BigInt.fromI32(0), BigInt.fromI32(100), BigInt.fromI32(0)],
  [BigInt.fromI32(50000), BigInt.fromI32(150), BigInt.fromI32(5000000)],
  [BigInt.fromI32(200000), BigInt.fromI32(200), BigInt.fromI32(27500000)],
  [BigInt.fromI32(500000), BigInt.fromI32(400), BigInt.fromI32(87500000)],
];

export const NFTBasedSlabs = [
  [BigInt.fromI32(0), BigInt.fromI32(150), BigInt.fromI32(0)],
  [BigInt.fromI32(50000), BigInt.fromI32(200), BigInt.fromI32(7500000)],
  [BigInt.fromI32(200000), BigInt.fromI32(300), BigInt.fromI32(37500000)],
  [BigInt.fromI32(500000), BigInt.fromI32(500), BigInt.fromI32(127500000)],
];

export const LBFR_START_TIMESTAMP = 1682352000;

export const RouterAddress = "0x0e0A1241C9cE6649d5D30134a194BA3E24130305";
export const USDC_ADDRESS = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
export const ARB_TOKEN_ADDRESS = "0x912CE59144191C1204E64559FE8253a0e49E6548";
export const UNISWAP_POOL_CONTRACT =
  "0x81c48D31365e6B526f6BBadC5c9aaFd822134863";
