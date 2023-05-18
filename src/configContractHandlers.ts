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

export function _handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  const address = event.params.config;
  const entity = new ConfigContract(address);
  entity.address = address;
  entity.baseSettlementFeeForAbove = event.params.baseSettlementFeeForAbove;
  entity.baseSettlementFeeForBelow = event.params.baseSettlementFeeForBelow;
  entity.maxFee = ZERO;
  entity.minFee = ZERO;
  entity.minPeriod = ZERO;
  entity.maxPeriod = ZERO;
  entity.id = address;
  entity.save();

  const optionContractInstance = _loadOrCreateOptionContractEntity(
    event.address
  );
  optionContractInstance.configContract = entity.id;
  optionContractInstance.save();
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
