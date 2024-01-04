import { Address } from "@graphprotocol/graph-ts";
import {
  UpdateCircuitBreakerContract,
  UpdateMaxSkew,
  UpdatePayout,
  UpdateSf,
  UpdateStrikeStepSize,
} from "../generated/AboveBelowConfigs/AboveBelowConfig";
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
  UpdateOptionStorageContract,
  UpdatePlatformFee,
  UpdatePoolOIConfigContract,
  UpdateSettlementFeeDisbursalContract,
  UpdateSpreadConfig1,
  UpdateSpreadConfig2,
  UpdateSpreadFactor,
  UpdatetraderNFTContract,
} from "../generated/BufferConfigUpdates/BufferConfig";
import { ConfigContract } from "../generated/schema";
import {
  ARB_POOL_CONTRACT,
  BFR_POOL_CONTRACT,
  USDC_POL_POOL_CONTRACT,
  USDC_POOL_CONTRACT,
  V2_ARB_POOL_CONTRACT,
  V2_USDC_POOL_CONTRACT,
} from "./config";
import { ZERO, _loadOrCreateOptionContractEntity } from "./initialize";

export function findPoolAndTokenFromPoolAddress(
  poolAddress: Address
): string[] {
  let token: string;
  let pool: string;
  if (poolAddress == Address.fromString(USDC_POL_POOL_CONTRACT)) {
    token = "USDC";
    pool = "USDC_POL";
  } else if (poolAddress == Address.fromString(ARB_POOL_CONTRACT)) {
    token = "ARB";
    pool = "ARB";
  } else if (poolAddress == Address.fromString(USDC_POOL_CONTRACT)) {
    token = "USDC";
    pool = "USDC";
  } else if (poolAddress == Address.fromString(BFR_POOL_CONTRACT)) {
    token = "BFR";
    pool = "BFR";
  } else if (poolAddress == Address.fromString(V2_ARB_POOL_CONTRACT)) {
    token = "ARB";
    pool = "V2_ARB";
  } else if (poolAddress == Address.fromString(V2_USDC_POOL_CONTRACT)) {
    token = "USDC";
    pool = "V2_USDC";
  } else {
    token = "";
    pool = "";
  }
  return [token, pool];
}

const zeroAddress = "0x0000000000000000000000000000000000000000";

function _loadorCreateConfigContractEntity(address: Address): ConfigContract {
  const optionContract = Address.fromBytes(address).toHexString();
  let entity = ConfigContract.load(optionContract);
  if (entity == null) {
    entity = new ConfigContract(optionContract);
    entity.address = address;
    entity.maxFee = ZERO;
    entity.minFee = ZERO;
    entity.minPeriod = ZERO;
    entity.maxPeriod = ZERO;
    entity.id = optionContract;
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
    entity.SpreadFactor = ZERO;

    entity.maxSkew = ZERO;
    entity.circuitBreakerContract = Address.fromString(zeroAddress);
    entity.optionStorageContract = Address.fromString(zeroAddress);
    entity.payout = ZERO;
    entity.sfdContract = Address.fromString(zeroAddress);
    entity.sf = ZERO;
    entity.traderNFTContract = Address.fromString(zeroAddress);
    entity.stepSize = ZERO;
  }
  return entity;
}

export function _handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  const optionContractInstance = _loadOrCreateOptionContractEntity(
    Address.fromBytes(event.address).toHexString()
  );
  optionContractInstance.category = event.params.category;
  optionContractInstance.configContract = _loadorCreateConfigContractEntity(
    event.params.config
  ).id;
  optionContractInstance.poolContract = event.params.pool;

  optionContractInstance.asset = event.params.token0 + event.params.token1;
  optionContractInstance.token0 = event.params.token0;
  optionContractInstance.token1 = event.params.token1;
  const tokenPool = findPoolAndTokenFromPoolAddress(event.params.pool);
  optionContractInstance.token = tokenPool[0];
  optionContractInstance.pool = tokenPool[1];
  optionContractInstance.save();
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

export function _handleUpdateSpreadFactor(event: UpdateSpreadFactor): void {
  const address = event.address;
  const entity = _loadorCreateConfigContractEntity(address);

  entity.SpreadFactor = event.params.ivFactorOTM;
  entity.save();
}

export function _handleUpdateMaxSkew(event: UpdateMaxSkew): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.maxSkew = event.params._maxSkew;
  entity.save();
}

export function _handleUpdateCircuitBreakerContract(
  event: UpdateCircuitBreakerContract
): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.circuitBreakerContract = event.params._circuitBreakerContract;
  entity.save();
}

export function _handleUpdateOptionStorageContract(
  event: UpdateOptionStorageContract
): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.optionStorageContract = event.params.value;
  entity.save();
}

export function _handleUpdatePayout(event: UpdatePayout): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.payout = event.params.payout;
  entity.save();
}

export function _handleUpdateSettlementFeeDisbursalContract(
  event: UpdateSettlementFeeDisbursalContract
): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.sfdContract = event.params.value;
  entity.save();
}

export function _handleUpdateSf(event: UpdateSf): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.sf = event.params.sf;
  entity.save();
}

export function _handleUpdatetraderNFTContract(
  event: UpdatetraderNFTContract
): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.traderNFTContract = event.params.value;
  entity.save();
}

export function _handleUpdateStepSize(event: UpdateStrikeStepSize): void {
  const entity = _loadorCreateConfigContractEntity(event.address);
  entity.stepSize = event.params.strikeStepSize;
  entity.save();
}
