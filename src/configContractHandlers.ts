import { Address } from "@graphprotocol/graph-ts";
import { CreateOptionsContract } from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  UpdateCreationWindowContract,
  UpdateEarlyClose,
  UpdateEarlyCloseThreshold,
  UpdateIV,
  UpdateIVFactorITM,
  UpdateIVFactorOTM,
  UpdateMarketOIConfigContract,
  UpdateMaxPeriod,
  UpdateMinFee,
  UpdateMinPeriod,
  UpdatePlatformFee,
  UpdatePoolOIConfigContract,
  UpdateSpreadConfig1,
  UpdateSpreadConfig2,
} from "../generated/BufferConfigUpdates/BufferConfig";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { ConfigContract } from "../generated/schema";
import { V2_RouterAddress } from "./config";
import { ZERO, _loadOrCreateOptionContractEntity } from "./initialize";

const zeroAddress = "0x0000000000000000000000000000000000000000";

function _loadorCreateConfigContractEntity(address: Address): ConfigContract {
  let entity = ConfigContract.load(address);
  if (entity == null) {
    entity = new ConfigContract(address);
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
    entity.IV = ZERO;
    entity.IVchangeTimestamp = ZERO;
    entity.creationWindowAddress = Address.fromString(zeroAddress);
    entity.IVFactorITM = ZERO;
    entity.IVFactorOTM = ZERO;
    entity.SpreadConfig1 = ZERO;
    entity.SpreadConfig2 = ZERO;
  }
  return entity;
}

export function _handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  const address = event.params.config;
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(V2_RouterAddress));
  if (
    routerContract.try_contractRegistry(contractAddress).reverted == false &&
    routerContract.try_contractRegistry(contractAddress).value == true
  ) {
    const entity = _loadorCreateConfigContractEntity(address);

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
  const entity = _loadorCreateConfigContractEntity(address);

  entity.minFee = event.params.value;
  entity.save();
}

export function _handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.maxPeriod = event.params.value;
  entity.save();
}

export function _handleUpdateMinPeriod(event: UpdateMinPeriod): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.minPeriod = event.params.value;
  entity.save();
}

export function _handleUpdatePlatformFee(event: UpdatePlatformFee): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.platformFee = event.params._platformFee;
  entity.save();
}

export function _handleUpdateEarlyCloseThreshold(
  event: UpdateEarlyCloseThreshold
): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.earlyCloseThreshold = event.params.earlyCloseThreshold;
  entity.save();
}

export function _handleUpdateEarlyClose(event: UpdateEarlyClose): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.isEarlyCloseEnabled = event.params.isAllowed;
  entity.save();
}

export function _handleUpdateOiconfigContract(
  event: UpdateMarketOIConfigContract
): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.marketOIaddress = event.params._marketOIConfigContract;
  entity.save();
}

export function _handleUpdatePoolOIContract(
  event: UpdatePoolOIConfigContract
): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.poolOIaddress = event.params._poolOIConfigContract;
  entity.save();
}

export function _handleUpdateIV(event: UpdateIV): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.IV = event.params._iv;
  entity.IVchangeTimestamp = event.block.timestamp;
  entity.save();
}

export function _handleUpdateCreationWindowContract(
  event: UpdateCreationWindowContract
): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.creationWindowAddress = event.params.value;
  entity.save();
}

export function _handleUpdateSpreadConfig1(event: UpdateSpreadConfig1): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.SpreadConfig1 = event.params.spreadConfig1;
  entity.save();
}

export function _handleUpdateSpreadConfig2(event: UpdateSpreadConfig2): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.SpreadConfig2 = event.params.spreadConfig2;
  entity.save();
}

export function _handleUpdateIVFactorITM(event: UpdateIVFactorITM): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.IVFactorITM = event.params.ivFactorITM;
  entity.save();
}

export function _handleUpdateIVFactorOTM(event: UpdateIVFactorOTM): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.IVFactorOTM = event.params.ivFactorOTM;
  entity.save();
}
