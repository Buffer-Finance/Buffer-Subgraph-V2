import { Address } from "@graphprotocol/graph-ts";
import {
  UpdateCreationWindowContract,
  UpdateMaxFee,
  UpdateMaxPeriod,
  UpdateMinFee,
  UpdateMinPeriod,
} from "../generated/Config/Config";
import { ConfigContract } from "../generated/schema";
import { ZERO } from "./initialize";

export function _loadOrCreateConfigContractEntity(
  address: string
): ConfigContract {
  let entity = ConfigContract.load(address);
  if (entity == null) {
    entity = new ConfigContract(address);
    entity.address = Address.fromHexString(address);
    entity.minPeriod = ZERO;
    entity.maxPeriod = ZERO;
    entity.minFee = ZERO;
    entity.maxFee = ZERO;
    entity.save();
  }
  return entity;
}

export function _handlehandleUpdateMinPeriod(event: UpdateMinPeriod): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.minPeriod = event.params.value;
  entity.save();
}

export function _handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.maxPeriod = event.params.value;
  entity.save();
}

export function _handleUpdateMinFee(event: UpdateMinFee): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.minFee = event.params.value;
  entity.save();
}

export function _handleUpdateMaxFee(event: UpdateMaxFee): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.maxFee = event.params.value;
  entity.save();
}

export function _handleUpdateCreationWindowContract(
  event: UpdateCreationWindowContract
): void {
  const entity = _loadOrCreateConfigContractEntity(event.address.toHexString());
  entity.creationWindowContract = event.params.value;
  entity.save();
}
