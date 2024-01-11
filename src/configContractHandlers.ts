import { Address } from "@graphprotocol/graph-ts";
import {
  UpdateCircuitBreakerContract,
  UpdateCreationWindowContract,
  UpdateMinFee,
  UpdateOptionStorageContract,
  UpdatePlatformFee,
  UpdateSettlementFeeDisbursalContract,
  UpdateSf,
  UpdateStrikeStepSize,
  UpdatetraderNFTContract,
} from "../generated/Config/Config";
import { ConfigContract } from "../generated/schema";
import { ZeroAddress } from "./config";
import { ZERO } from "./initialize";

export function _loadOrCreateConfigContractEntity(
  address: string
): ConfigContract {
  let entity = ConfigContract.load(address);
  if (entity == null) {
    entity = new ConfigContract(address);
    entity.address = Address.fromHexString(address);
    entity.creationWindowContract = Address.fromHexString(ZeroAddress);
    entity.circuitBreakerContract = Address.fromHexString(ZeroAddress);
    entity.optionStorageContract = Address.fromHexString(ZeroAddress);
    entity.sfdContract = Address.fromHexString(ZeroAddress);
    entity.traderNFTContract = Address.fromHexString(ZeroAddress);
    // entity.iv = ZERO;
    // entity.ivFactorITM = ZERO;
    // entity.ivFactorOTM = ZERO;
    // entity.payout = ZERO;
    entity.platformFee = ZERO;
    entity.sf = ZERO;
    // entity.maxSkew = ZERO;
    entity.stepSize = ZERO;
    // entity.minPeriod = ZERO;
    // entity.maxPeriod = ZERO;
    entity.minFee = ZERO;
    // entity.maxFee = ZERO;
    entity.save();
  }
  return entity;
}

// export function _handlehandleUpdateMinPeriod(event: UpdateMinPeriod): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.minPeriod = event.params.value;
//   entity.save();
// }

// export function _handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.maxPeriod = event.params.value;
//   entity.save();
// }

export function _handleUpdateMinFee(event: UpdateMinFee): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.minFee = event.params.value;
  entity.save();
}

// export function _handleUpdateMaxFee(event: UpdateMaxFee): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.maxFee = event.params.value;
//   entity.save();
// }

export function _handleUpdateCreationWindowContract(
  event: UpdateCreationWindowContract
): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.creationWindowContract = event.params.value;
  entity.save();
}

// export function _handleUpdateMaxSkew(event: UpdateMaxSkew): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.maxSkew = event.params._maxSkew;
//   entity.save();
// }

export function _handleUpdateCircuitBreakerContract(
  event: UpdateCircuitBreakerContract
): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.circuitBreakerContract = event.params._circuitBreakerContract;
  entity.save();
}

// export function _handleUpdateIV(event: UpdateIV): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.iv = event.params._iv;
//   entity.save();
// }

// export function _handleUpdateIVFactorITM(event: UpdateIVFactorITM): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.ivFactorITM = event.params.ivFactorITM;
//   entity.save();
// }

// export function _handleUpdateIVFactorOTM(event: UpdateIVFactorOTM): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.ivFactorOTM = event.params.ivFactorOTM;
//   entity.save();
// }

export function _handleUpdateOptionStorageContract(
  event: UpdateOptionStorageContract
): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.optionStorageContract = event.params.value;
  entity.save();
}

// export function _handleUpdatePayout(event: UpdatePayout): void {
//   const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
//   entity.payout = event.params.payout;
//   entity.save();
// }

export function _handleUpdatePlatformFee(event: UpdatePlatformFee): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.platformFee = event.params._platformFee;
  entity.save();
}

export function _handleUpdateSettlementFeeDisbursalContract(
  event: UpdateSettlementFeeDisbursalContract
): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.sfdContract = event.params.value;
  entity.save();
}

export function _handleUpdateSf(event: UpdateSf): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.sf = event.params.sf;
  entity.save();
}

export function _handleUpdatetraderNFTContract(
  event: UpdatetraderNFTContract
): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.traderNFTContract = event.params.value;
  entity.save();
}

export function _handleUpdateStepSize(event: UpdateStrikeStepSize): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.stepSize = event.params.strikeStepSize;
  entity.save();
}
