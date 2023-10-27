import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { BuggyOptionContract, OptionContract } from "../generated/schema";
import { ADDRESS_ZERO, RouterAddress, RouterAddressBytes } from "./config";
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

export function findRouterContract(address: string): string {
  const contractAddress = Address.fromString(address);
  const routerContract = BufferRouter.bind(RouterAddressBytes);

  if (routerContract.contractRegistry(contractAddress) == true) {
    return RouterAddress;
  } else {
    return ADDRESS_ZERO;
  }
}

export function isContractRegisteredToRouter(
  optionContractInstance: OptionContract
): boolean {
  if (optionContractInstance.routerContract === RouterAddress) return true;
  else {
    const buggyContractInstance = new BuggyOptionContract(
      optionContractInstance.id
    );
    buggyContractInstance.contract = optionContractInstance.id;
    buggyContractInstance.save();
    return false;
  }
}
