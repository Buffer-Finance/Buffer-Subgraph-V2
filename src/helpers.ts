import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { OptionContract } from "../generated/schema";
import { ADDRESS_ZERO_BYTES, RouterAddressBytes } from "./config";

export function _getDayId(timestamp: BigInt): string {
  let dayTimestamp = (timestamp.toI32() - 16 * 3600) / 86400;
  return dayTimestamp.toString();
}

export function _getWeekId(timestamp: BigInt): string {
  let weekTimestamp = (timestamp.toI32() - 4 * 86400 - 16 * 3600) / (86400 * 7);
  return weekTimestamp.toString();
}

export function _getHourId(timestamp: BigInt): string {
  let hourTimestamp = (timestamp.toI32() - 16 * 3600) / 3600;
  return hourTimestamp.toString();
}

export function findRouterContract(address: Bytes): Bytes {
  const contractAddress = address;
  const routerContract = BufferRouter.bind(RouterAddressBytes);

  if (routerContract.contractRegistry(contractAddress) == true) {
    return RouterAddressBytes;
  } else {
    return ADDRESS_ZERO_BYTES;
  }
}

export function isContractRegisteredToRouter(
  optionContractInstance: OptionContract
): boolean {
  return optionContractInstance.routerContract == RouterAddressBytes;
}
