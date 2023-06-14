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
} from "../generated/BufferConfigUpdates/BufferConfig";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { Address } from "@graphprotocol/graph-ts";
import { RouterAddress } from "./config";

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
    entity.save();

    const optionContractInstance = _loadOrCreateOptionContractEntity(
      contractAddress
    );
    optionContractInstance.category = 0;
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
