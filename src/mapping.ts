import {
  Create,
  CreateMarket,
  CreateOptionsContract,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  CancelTrade,
  InitiateTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import {
  UpdateCircuitBreakerContract,
  UpdateCreationWindowContract,
  UpdateIV,
  // UpdateIVFactorITM,
  // UpdateIVFactorOTM,
  UpdateMaxSkew,
  UpdateOptionStorageContract,
  UpdatePayout,
  UpdatePlatformFee,
  UpdateSettlementFeeDisbursalContract,
  UpdateSf,
  UpdateStrikeStepSize,
  UpdatetraderNFTContract,
} from "../generated/Config/Config";
import {
  _handleUpdateCircuitBreakerContract,
  _handleUpdateCreationWindowContract,
  _handleUpdateIV,
  // _handleUpdateIVFactorITM,
  // _handleUpdateIVFactorOTM,
  _handleUpdateMaxSkew,
  _handleUpdateOptionStorageContract,
  _handleUpdatePayout,
  _handleUpdatePlatformFee,
  _handleUpdateSettlementFeeDisbursalContract,
  _handleUpdateSf,
  _handleUpdateStepSize,
  _handleUpdatetraderNFTContract,
} from "./configContractHandlers";
import {
  _handleCreate,
  _handleCreateContract,
  _handleCreateMarket,
  _handleExercise,
  _handleExpire,
  _handlePause,
} from "./optionContractHandlers";
import {
  _handleCancelTrade,
  _handleInitiateTrade,
  _handleOpenTrade,
} from "./routerContractHandlers";

export function handleCreateContract(event: CreateOptionsContract): void {
  _handleCreateContract(event);
}

export function handleInitiateTrade(event: InitiateTrade): void {
  _handleInitiateTrade(event);
}

export function handleOpenTrade(event: OpenTrade): void {
  _handleOpenTrade(event);
}

export function handleCancelTrade(event: CancelTrade): void {
  _handleCancelTrade(event);
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

export function handleCreateMarket(event: CreateMarket): void {
  _handleCreateMarket(event);
}
// export function handleUpdateMinPeriod(event: UpdateMinPeriod): void {
//   _handlehandleUpdateMinPeriod(event);
// }

// export function handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
//   _handleUpdateMaxPeriod(event);
// }

// export function handleUpdateMinFee(event: UpdateMinFee): void {
//   _handleUpdateMinFee(event);
// }

// export function handleUpdateMaxFee(event: UpdateMaxFee): void {
//   _handleUpdateMaxFee(event);
// }

export function handleUpdateCreationWindowContract(
  event: UpdateCreationWindowContract
): void {
  _handleUpdateCreationWindowContract(event);
}

export function handleUpdateMaxSkew(event: UpdateMaxSkew): void {
  _handleUpdateMaxSkew(event);
}

export function handleUpdateCircuitBreakerContract(
  event: UpdateCircuitBreakerContract
): void {
  _handleUpdateCircuitBreakerContract(event);
}

export function handleUpdateIV(event: UpdateIV): void {
  _handleUpdateIV(event);
}

// export function handleUpdateIVFactorITM(event: UpdateIVFactorITM): void {
//   _handleUpdateIVFactorITM(event);
// }

// export function handleUpdateIVFactorOTM(event: UpdateIVFactorOTM): void {
//   _handleUpdateIVFactorOTM(event);
// }

export function handleUpdateOptionStorageContract(
  event: UpdateOptionStorageContract
): void {
  _handleUpdateOptionStorageContract(event);
}

export function handleUpdatePayout(event: UpdatePayout): void {
  _handleUpdatePayout(event);
}

export function handleUpdatePlatformFee(event: UpdatePlatformFee): void {
  _handleUpdatePlatformFee(event);
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
