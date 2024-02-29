import { Create as CreateAB } from "../generated/AboveBelowBufferBinaryOptions/AboveBelowBufferBinaryOptions";
import {
  OpenTrade as AboveBelowOpenTrade,
  CancelTrade,
  InitiateTrade,
} from "../generated/AboveBelowBufferRouter/AboveBelowBufferRouter";
import {
  UpdateCircuitBreakerContract,
  UpdateMaxSkew,
  UpdatePayout,
  UpdateSf,
  UpdateStrikeStepSize,
} from "../generated/AboveBelowConfigs/AboveBelowConfig";
import {
  Create,
  CreateOptionsContract,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
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
import { OpenTrade } from "../generated/BufferRouter/BufferRouter";
import {
  Exercise as ExerciseV1,
  Expire as ExpireV1,
} from "../generated/V1Options/V1Options";
import {
  _handleCreateOptionsContract,
  _handleUpdateCircuitBreakerContract,
  _handleUpdateCreationWindowContract,
  _handleUpdateEarlyClose,
  _handleUpdateEarlyCloseThreshold,
  _handleUpdateIV,
  _handleUpdateIVFactorITM,
  _handleUpdateIVFactorOTM,
  _handleUpdateMaxPeriod,
  _handleUpdateMaxSkew,
  _handleUpdateMinFee,
  _handleUpdateMinPeriod,
  _handleUpdateOiconfigContract,
  _handleUpdateOptionStorageContract,
  _handleUpdatePayout,
  _handleUpdatePlatformFee,
  _handleUpdatePoolOIContract,
  _handleUpdateSettlementFeeDisbursalContract,
  _handleUpdateSf,
  _handleUpdateSpreadConfig1,
  _handleUpdateSpreadConfig2,
  _handleUpdateSpreadFactor,
  _handleUpdateStepSize,
  _handleUpdatetraderNFTContract,
} from "./configContractHandlers";

import {
  _handleCreate,
  _handleCreateAB,
  _handleExercise,
  _handleExerciseV1,
  _handleExpire,
  _handleExpireV1,
  _handlePause,
} from "./optionContractHandlers";
import {
  _handleAboveBelowCancelTrade,
  _handleAboveBelowInitiateTrade,
  _handleAboveBelowOpenTrade,
  _handleOpenTrade,
} from "./routerContractHandlers";

export function handleOpenTrade(event: OpenTrade): void {
  _handleOpenTrade(event);
}

export function handleCreate(event: Create): void {
  _handleCreate(event);
}

export function handleExercise(event: Exercise): void {
  _handleExercise(event);
}

export function handleExpire(event: Expire): void {
  _handleExpire(event);
}

export function handlePause(event: Pause): void {
  _handlePause(event);
}

export function handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  _handleCreateOptionsContract(event);
}

export function handleUpdateMinFee(event: UpdateMinFee): void {
  _handleUpdateMinFee(event);
}

export function handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
  _handleUpdateMaxPeriod(event);
}

export function handleUpdateMinPeriod(event: UpdateMinPeriod): void {
  _handleUpdateMinPeriod(event);
}

export function handleUpdatePlatformFee(event: UpdatePlatformFee): void {
  _handleUpdatePlatformFee(event);
}

export function handleUpdateEarlyCloseThreshold(
  event: UpdateEarlyCloseThreshold
): void {
  _handleUpdateEarlyCloseThreshold(event);
}

export function handleUpdateEarlyClose(event: UpdateEarlyClose): void {
  _handleUpdateEarlyClose(event);
}

export function handleUpdateOiconfigContract(
  event: UpdateMarketOIConfigContract
): void {
  _handleUpdateOiconfigContract(event);
}
export function handleUpdatePoolOIContract(
  event: UpdatePoolOIConfigContract
): void {
  _handleUpdatePoolOIContract(event);
}

export function handleUpdateIV(event: UpdateIV): void {
  _handleUpdateIV(event);
}

export function handleExpireV1(event: ExpireV1): void {
  _handleExpireV1(event);
}

export function handleExerciseV1(event: ExerciseV1): void {
  _handleExerciseV1(event);
}

export function handleUpdateCreationWindowContract(
  event: UpdateCreationWindowContract
): void {
  _handleUpdateCreationWindowContract(event);
}

export function handleUpdateIVFactorOTM(event: UpdateIVFactorOTM): void {
  _handleUpdateIVFactorOTM(event);
}

export function handleUpdateIVFactorITM(event: UpdateIVFactorITM): void {
  _handleUpdateIVFactorITM(event);
}

export function handleUpdateSpreadConfig1(event: UpdateSpreadConfig1): void {
  _handleUpdateSpreadConfig1(event);
}

export function handleUpdateSpreadConfig2(event: UpdateSpreadConfig2): void {
  _handleUpdateSpreadConfig2(event);
}
export function handleUpdateSpreadFactor(event: UpdateSpreadFactor): void {
  _handleUpdateSpreadFactor(event);
}

export function handleUpdateSettlementFeeDisbursalContract(
  event: UpdateSettlementFeeDisbursalContract
): void {
  _handleUpdateSettlementFeeDisbursalContract(event);
}

export function handleUpdateSf(event: UpdateSf): void {
  _handleUpdateSf(event);
}

export function handleUpdatetraderNFTContract(
  event: UpdatetraderNFTContract
): void {
  _handleUpdatetraderNFTContract(event);
}

export function handleUpdateStrikeStepSize(event: UpdateStrikeStepSize): void {
  _handleUpdateStepSize(event);
}

export function handleUpdateOptionStorageContract(
  event: UpdateOptionStorageContract
): void {
  _handleUpdateOptionStorageContract(event);
}

export function handleUpdatePayout(event: UpdatePayout): void {
  _handleUpdatePayout(event);
}

export function handleUpdateMaxSkew(event: UpdateMaxSkew): void {
  _handleUpdateMaxSkew(event);
}

export function handleUpdateCircuitBreakerContract(
  event: UpdateCircuitBreakerContract
): void {
  _handleUpdateCircuitBreakerContract(event);
}

export function handleCreateAB(event: CreateAB): void {
  _handleCreateAB(event);
}

export function handleAboveBelowInitiateTrade(event: InitiateTrade): void {
  _handleAboveBelowInitiateTrade(event);
}

export function handleAboveBelowCancelTrade(event: CancelTrade): void {
  _handleAboveBelowCancelTrade(event);
}

export function handleAboveBelowOpenTrade(event: AboveBelowOpenTrade): void {
  _handleAboveBelowOpenTrade(event);
}
