import {
  BufferBinaryOptions,
  CreateOptionsContract,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { ConfigContract, OptionContract } from "../generated/schema";
import { ZERO, _loadOrCreateOptionContractEntity } from "./initialize";
import {
  UpdateMinFee,
  UpdateMaxPeriod,
  UpdateMinPeriod,
  UpdatePlatformFee,
  UpdateEarlyClose,
  UpdateEarlyCloseThreshold,
  UpdateMarketOIConfigContract,
  UpdatePoolOIConfigContract,
} from "../generated/BufferConfigUpdates/BufferConfig";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { Address } from "@graphprotocol/graph-ts";
import { RouterAddress } from "./config";
const zeroAddress = "0x0000000000000000000000000000000000000000";
function _getTokens(inputString: string, delimiter: string): string[] {
  const delimiterIndex = inputString.indexOf(delimiter);
  if (delimiterIndex !== -1) {
    const firstPart = inputString.slice(0, delimiterIndex);
    const secondPart = inputString.slice(delimiterIndex + delimiter.length);
    return [firstPart, secondPart];
  }
  return [inputString];
}

export function _handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  const address = event.params.config;
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (
    routerContract.try_contractRegistry(contractAddress).reverted == false &&
    routerContract.try_contractRegistry(contractAddress).value == true
  ) {
    const entity = new ConfigContract(address);
    // const poolContractEntity = new PoolContract(address);
    // poolContractEntity.address = event.params.pool;
    // poolContractEntity.token = event.params.tokenX;
    // poolContractEntity.decimals = 6;
    // poolContractEntity.meta = zeroAddress;
    // poolContractEntity.token = zeroAddress;
    // poolContractEntity.save();

    entity.address = address;
    entity.maxFee = ZERO;
    entity.minFee = ZERO;
    entity.minPeriod = ZERO;
    entity.maxPeriod = ZERO;
    entity.id = address;
    entity.platformFee = ZERO;
    entity.isEarlyCloseEnabled = false;
    entity.marketOIaddress = Address.fromString(zeroAddress);
    entity.poolOIaddress = Address.fromString(zeroAddress);
    entity.earlyCloseThreshold = ZERO;
    entity.save();

    const optionContractInstance =
      _loadOrCreateOptionContractEntity(contractAddress);
    optionContractInstance.category = event.params.category;
    optionContractInstance.configContract = entity.id;
    optionContractInstance.poolContract = event.params.pool;
    optionContractInstance.save();
  }
}

export function _handleUpdateMinFee(event: UpdateMinFee): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.minFee = event.params.value;
  entity.save();
}

export function _handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.maxPeriod = event.params.value;
  entity.save();
}

export function _handleUpdateMinPeriod(event: UpdateMinPeriod): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.minPeriod = event.params.value;
  entity.save();
}

export function _handleUpdatePlatformFee(event: UpdatePlatformFee): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.platformFee = event.params._platformFee;
  entity.save();
}

export function _handleUpdateEarlyCloseThreshold(
  event: UpdateEarlyCloseThreshold
): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.earlyCloseThreshold = event.params.earlyCloseThreshold;
  entity.save();
}

export function _handleUpdateEarlyClose(event: UpdateEarlyClose): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.isEarlyCloseEnabled = event.params.isAllowed;
  entity.save();
}

export function _handleUpdateOiconfigContract(
  event: UpdateMarketOIConfigContract
): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.marketOIaddress = event.params._marketOIConfigContract;
  entity.save();
}

export function _handleUpdatePoolOIContract(
  event: UpdatePoolOIConfigContract
): void {
  const address = event.address;
  const entity = ConfigContract.load(address);
  if (entity == null) {
    return;
  }
  entity.poolOIaddress = event.params._poolOIConfigContract;
  entity.save();
}
