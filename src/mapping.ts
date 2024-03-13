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
  ContractRegistryUpdated,
  InitiateTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import {
  UpdateCreationWindowContract,
  UpdateIV,
  // UpdateIVFactorITM,
  // UpdateIVFactorOTM,
  UpdateMaxSkew,
  UpdatePayout,
  UpdatePlatformFee,
  UpdateSf,
  UpdateStrikeStepSize,
} from "../generated/Config/Config";
import {
  _handleUpdateCreationWindowContract,
  _handleUpdateIV,
  _handleUpdateMaxSkew,
  _handleUpdatePayout,
  _handleUpdatePlatformFee,
  _handleUpdateSf,
  _handleUpdateStepSize,
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
  _handleContractRegistryUpdated,
  _handleInitiateTrade,
  _handleOpenTrade,
} from "./routerContractHandlers";

export function handleCreateContract(event: CreateOptionsContract): void {
  _handleCreateContract(event);
}

export function handleContractRegistryUpdated(
  event: ContractRegistryUpdated
): void {
  _handleContractRegistryUpdated(event);
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

export function handleUpdateCreationWindowContract(
  event: UpdateCreationWindowContract
): void {
  _handleUpdateCreationWindowContract(event);
}

export function handleUpdateMaxSkew(event: UpdateMaxSkew): void {
  _handleUpdateMaxSkew(event);
}

export function handleUpdateIV(event: UpdateIV): void {
  _handleUpdateIV(event);
}

export function handleUpdatePayout(event: UpdatePayout): void {
  _handleUpdatePayout(event);
}

export function handleUpdatePlatformFee(event: UpdatePlatformFee): void {
  _handleUpdatePlatformFee(event);
}

export function handleUpdateSf(event: UpdateSf): void {
  _handleUpdateSf(event);
}

export function handleUpdateStrikeStepSize(event: UpdateStrikeStepSize): void {
  _handleUpdateStepSize(event);
}
