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
  UpdateSpreadFactor,
  UpdateIncentivePoolContract
} from "../generated/BufferConfigUpdates/BufferConfig";
import { ConfigContract } from "../generated/schema";
import { ADDRESS_ZERO } from "./config";
import {
  ZERO,
  _loadOrCreateOptionContractEntity,
  findRouterContract,
} from "./initialize";

const zeroAddress = "0x0000000000000000000000000000000000000000";

function _loadorCreateConfigContractEntity(address: Address): ConfigContract {
  const optionContract = Address.fromBytes(address).toHexString();
  let entity = ConfigContract.load(optionContract);
  if (entity == null) {
    entity = new ConfigContract(optionContract);
    entity.address = optionContract;
    entity.maxFee = ZERO;
    entity.minFee = ZERO;
    entity.minPeriod = ZERO;
    entity.maxPeriod = ZERO;
    entity.id = optionContract;
    entity.platformFee = ZERO;
    entity.isEarlyCloseEnabled = false;
    entity.marketOIaddress = zeroAddress;
    entity.poolOIaddress = zeroAddress;
    entity.earlyCloseThreshold = ZERO;
    entity.IV = ZERO;
    entity.IVchangeTimestamp = ZERO;
    entity.creationWindowAddress = zeroAddress;
    entity.IVFactorITM = ZERO;
    entity.IVFactorOTM = ZERO;
    entity.SpreadConfig1 = ZERO;
    entity.SpreadConfig2 = ZERO;
    entity.SpreadFactor = ZERO;
    entity.IncentivePoolContract = zeroAddress;
  }
  return entity;
}

export function _handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  const routerContract = findRouterContract(
    Address.fromBytes(event.address).toHexString()
  );
  if (routerContract !== ADDRESS_ZERO) {
    const optionContractInstance = _loadOrCreateOptionContractEntity(
      Address.fromBytes(event.address).toHexString()
    );
    optionContractInstance.routerContract = routerContract;
    optionContractInstance.category = event.params.category;
    optionContractInstance.configContract = _loadorCreateConfigContractEntity(
      event.params.config
    ).id;
    optionContractInstance.poolContract = Address.fromBytes(
      event.params.pool
    ).toHexString();
    optionContractInstance.token0 = event.params.token0;
    optionContractInstance.token1 = event.params.token1;
    optionContractInstance.asset = event.params.token0 + event.params.token1;
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

  entity.marketOIaddress = Address.fromBytes(
    event.params._marketOIConfigContract
  ).toHexString();
  entity.save();
}

export function _handleUpdatePoolOIContract(
  event: UpdatePoolOIConfigContract
): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.poolOIaddress = Address.fromBytes(
    event.params._poolOIConfigContract
  ).toHexString();
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

  entity.creationWindowAddress = Address.fromBytes(
    event.params.value
  ).toHexString();
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

export function _handleUpdateSpreadFactor(event: UpdateSpreadFactor): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.SpreadFactor = event.params.ivFactorOTM;
  entity.save();
}

export function _handleUpdateIncentivePoolContract(event: UpdateIncentivePoolContract): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.IncentivePoolContract = event.params.incentivePool.toHexString();
  entity.save();
}
